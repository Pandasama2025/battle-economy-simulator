import { Unit, BattleState, BattleLogEntry, ActionType, SkillEffect, TerrainType } from '@/types/battle';

export class BattleSystem {
  private state: BattleState;
  
  constructor() {
    this.state = {
      id: crypto.randomUUID(),
      round: 0,
      status: 'preparing',
      teams: {
        alpha: [],
        beta: []
      },
      terrain: {
        type: 'plains' as TerrainType,
        effects: {}
      },
      log: [],
      environmentEffects: true
    };
  }

  initializeBattle(alphaTeam: Unit[], betaTeam: Unit[], terrainType: TerrainType = 'plains'): void {
    this.state.teams.alpha = JSON.parse(JSON.stringify(alphaTeam));
    this.state.teams.beta = JSON.parse(JSON.stringify(betaTeam));
    this.state.round = 0;
    this.state.status = 'preparing';
    this.state.log = [];
    this.state.terrain = {
      type: terrainType,
      effects: this.getTerrainEffects(terrainType)
    };
    
    this.applyTerrainEffectsToAllUnits();
  }

  private applyTerrainEffectsToAllUnits(): void {
    if (!this.state.environmentEffects) return;
    
    const allUnits = [...this.state.teams.alpha, ...this.state.teams.beta];
    for (const unit of allUnits) {
      this.applyTerrainEffects(unit);
    }
  }

  executeTurn(): void {
    if (this.state.status !== 'inProgress') {
      this.state.status = 'inProgress';
    }
    
    this.state.round++;
    
    this.regenerateMana();
    
    const allUnits = [...this.state.teams.alpha, ...this.state.teams.beta]
      .filter(unit => unit.currentHP > 0)
      .sort((a, b) => b.speed - a.speed);

    for (const unit of allUnits) {
      if (unit.status === 'stunned') {
        unit.status = 'idle';
        this.logAction(unit, unit, 'recover', 0, `${unit.name} 从眩晕中恢复`);
        continue;
      }
      
      if (unit.currentHP > 0) {
        this.executeUnitAction(unit);
      }
      
      if (this.checkBattleEnd()) {
        break;
      }
    }
    
    this.applyOverTimeEffects();
  }

  executeUnitAction(unit: Unit): void {
    const targets = this.getValidTargets(unit);
    if (targets.length === 0) return;

    const target = this.selectTarget(unit, targets);
    
    const action = this.determineAction(unit);
    
    this.performAction(unit, target, action);
    
    this.reduceCooldowns(unit);
  }

  getValidTargets(unit: Unit): Unit[] {
    const enemyTeam = unit.team === 'alpha' ? this.state.teams.beta : this.state.teams.alpha;
    return enemyTeam.filter(target => target.currentHP > 0);
  }

  getAllyTargets(unit: Unit): Unit[] {
    const allyTeam = unit.team === 'alpha' ? this.state.teams.alpha : this.state.teams.beta;
    return allyTeam.filter(target => target.id !== unit.id && target.currentHP > 0);
  }

  selectTarget(attacker: Unit, targets: Unit[]): Unit {
    if (attacker.type === 'Assassin') {
      const mageTargets = targets.filter(t => t.type === 'Mage');
      if (mageTargets.length > 0) {
        return mageTargets.reduce((lowest, current) => 
          current.currentHP < lowest.currentHP ? current : lowest
        );
      }
    }
    
    if (attacker.type === 'Priest' && Math.random() > 0.5) {
      const allies = this.getAllyTargets(attacker);
      const woundedAllies = allies.filter(a => a.currentHP < a.maxHP * 0.7);
      
      if (woundedAllies.length > 0) {
        return woundedAllies.reduce((mostWounded, current) => 
          (current.currentHP / current.maxHP) < (mostWounded.currentHP / mostWounded.maxHP) 
            ? current : mostWounded
        );
      }
    }
    
    return targets.reduce((lowest, current) => 
      current.currentHP < lowest.currentHP ? current : lowest
    );
  }

  determineAction(unit: Unit): ActionType {
    if (unit.type === 'Priest') {
      const woundedAllies = this.getAllyTargets(unit).filter(a => a.currentHP < a.maxHP * 0.7);
      if (woundedAllies.length > 0 && unit.currentMana >= 30) {
        return 'heal';
      }
    }
    
    const availableSkills = unit.skills.filter(skill => 
      skill.manaCost <= unit.currentMana && skill.currentCooldown === 0
    );
    
    if (availableSkills.length > 0) {
      const skillChance = unit.magicPower > unit.attack ? 0.7 : 0.4;
      if (Math.random() < skillChance) {
        return 'skill';
      }
    }
    
    if (unit.type === 'Merchant' && Math.random() < 0.3 && unit.currentMana >= 20) {
      return 'buff';
    }
    
    if (unit.currentHP < unit.maxHP * 0.3 && Math.random() < 0.4) {
      return 'defend';
    }
    
    return 'attack';
  }

  performAction(attacker: Unit, target: Unit, action: ActionType): void {
    switch (action) {
      case 'attack':
        this.performAttack(attacker, target);
        break;
      case 'skill':
        this.performSkill(attacker, target);
        break;
      case 'defend':
        this.performDefend(attacker);
        break;
      case 'heal':
        this.performHeal(attacker, target);
        break;
      case 'buff':
        this.performBuff(attacker, target);
        break;
      default:
        this.performAttack(attacker, target);
    }
  }

  performAttack(attacker: Unit, defender: Unit): void {
    const baseDamage = this.calculateDamage(attacker, defender);
    const isCrit = Math.random() < attacker.critRate;
    const damage = Math.floor(isCrit ? baseDamage * attacker.critDamage : baseDamage);
    
    defender.currentHP = Math.max(0, defender.currentHP - damage);
    
    this.logAction(
      attacker, 
      defender, 
      'attack', 
      damage, 
      isCrit 
        ? `${attacker.name} 暴击攻击 ${defender.name}，造成 ${damage} 点伤害` 
        : `${attacker.name} 攻击 ${defender.name}，造成 ${damage} 点伤害`
    );
    
    if (defender.currentHP <= 0) {
      defender.status = 'dead';
      this.logAction(attacker, defender, 'attack', 0, `${defender.name} 已被击败`);
    }
  }

  performSkill(attacker: Unit, target: Unit): void {
    const availableSkills = attacker.skills.filter(skill => 
      skill.manaCost <= attacker.currentMana && skill.currentCooldown === 0
    );
    
    if (availableSkills.length === 0) {
      this.performAttack(attacker, target);
      return;
    }
    
    const skill = availableSkills.reduce((strongest, current) => 
      current.damage > strongest.damage ? current : strongest
    );
    
    const damage = this.calculateSkillDamage(attacker, target, skill);
    
    target.currentHP = Math.max(0, target.currentHP - damage);
    
    attacker.currentMana -= skill.manaCost;
    
    skill.currentCooldown = skill.cooldown;
    
    this.logAction(
      attacker, 
      target, 
      'skill', 
      damage, 
      `${attacker.name} 使用技能 ${skill.name} 对 ${target.name} 造成 ${damage} 点伤害`,
      skill.id
    );
    
    if (skill.effects && skill.effects.length > 0) {
      this.applySkillEffects(skill.effects, attacker, target);
    }
    
    if (target.currentHP <= 0) {
      target.status = 'dead';
      this.logAction(attacker, target, 'skill', 0, `${target.name} 已被击败`);
    }
  }

  performDefend(unit: Unit): void {
    unit.status = 'defending';
    const defenseBoost = Math.floor(unit.defense * 0.5);
    unit.defense += defenseBoost;
    
    this.logAction(
      unit, 
      unit, 
      'defend', 
      defenseBoost, 
      `${unit.name} 进入防御姿态，防御力提升 ${defenseBoost}`
    );
    
    setTimeout(() => {
      if (unit.status === 'defending') {
        unit.defense -= defenseBoost;
        unit.status = 'idle';
      }
    }, 0);
  }

  performHeal(healer: Unit, target: Unit): void {
    const healAmount = Math.floor(healer.magicPower * 1.2);
    const oldHP = target.currentHP;
    
    target.currentHP = Math.min(target.maxHP, target.currentHP + healAmount);
    const actualHeal = target.currentHP - oldHP;
    
    healer.currentMana -= 30;
    
    this.logAction(
      healer, 
      target, 
      'heal', 
      actualHeal, 
      `${healer.name} 治疗 ${target.name}，恢复 ${actualHeal} 点生命值`
    );
  }

  performBuff(caster: Unit, target: Unit): void {
    let buffAmount = 0;
    let buffType = '';
    
    if (caster.type === 'Merchant') {
      buffAmount = Math.floor(target.attack * 0.2);
      target.attack += buffAmount;
      buffType = '攻击力';
    } else if (caster.type === 'Priest') {
      buffAmount = Math.floor(target.defense * 0.2);
      target.defense += buffAmount;
      buffType = '防御力';
    } else {
      buffAmount = Math.floor(target.speed * 0.2);
      target.speed += buffAmount;
      buffType = '速度';
    }
    
    caster.currentMana -= 20;
    
    this.logAction(
      caster, 
      target, 
      'buff', 
      buffAmount, 
      `${caster.name} 增强了 ${target.name} 的${buffType}，提升 ${buffAmount} 点`
    );
  }

  calculateDamage(attacker: Unit, defender: Unit): number {
    const attackPower = attacker.attack;
    const defensePower = defender.defense;
    const penetration = Math.max(0, attackPower * 0.1);
    
    let terrainModifier = 1.0;
    if (this.state.terrain.effects[attacker.type]) {
      terrainModifier += this.state.terrain.effects[attacker.type];
    }
    
    const baseDamage = (attackPower * terrainModifier) - (defensePower - penetration);
    
    return Math.max(1, Math.floor(baseDamage));
  }

  calculateSkillDamage(attacker: Unit, defender: Unit, skill: any): number {
    const magicPower = attacker.magicPower;
    const resistance = defender.magicResistance;
    const penetration = Math.max(0, magicPower * 0.15);
    
    let terrainModifier = 1.0;
    if (this.state.terrain.effects[attacker.type]) {
      terrainModifier += this.state.terrain.effects[attacker.type];
    }
    
    const baseDamage = ((skill.damage + magicPower) * terrainModifier) - (resistance - penetration);
    
    return Math.max(5, Math.floor(baseDamage));
  }

  applySkillEffects(effects: SkillEffect[], caster: Unit, target: Unit): void {
    effects.forEach(effect => {
      if (effect.chance && Math.random() > effect.chance) {
        return;
      }
      
      switch (effect.type) {
        case 'stun':
          if (target.status !== 'dead') {
            target.status = 'stunned';
            this.logAction(
              caster, 
              target, 
              'buff', 
              0, 
              `${target.name} 被眩晕，下回合无法行动`
            );
          }
          break;
          
        case 'debuff':
          const statToDebuff = ['attack', 'defense', 'speed'][Math.floor(Math.random() * 3)];
          const debuffAmount = Math.floor((target as any)[statToDebuff] * effect.value);
          (target as any)[statToDebuff] -= debuffAmount;
          
          this.logAction(
            caster, 
            target, 
            'buff', 
            -debuffAmount, 
            `${target.name} 的${statToDebuff === 'attack' ? '攻击力' : 
              statToDebuff === 'defense' ? '防御力' : '速度'}减少了 ${debuffAmount}`
          );
          break;
          
        default:
          break;
      }
    });
  }

  regenerateMana(): void {
    const allUnits = [...this.state.teams.alpha, ...this.state.teams.beta];
    allUnits.forEach(unit => {
      if (unit.currentHP > 0) {
        const regenAmount = Math.floor(unit.maxMana * 0.1);
        unit.currentMana = Math.min(unit.maxMana, unit.currentMana + regenAmount);
      }
    });
  }

  reduceCooldowns(unit: Unit): void {
    unit.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  }

  applyOverTimeEffects(): void {
    const allUnits = [...this.state.teams.alpha, ...this.state.teams.beta];
    
    if (this.state.terrain.type === 'fire') {
      allUnits.forEach(unit => {
        if (unit.currentHP > 0) {
          const burnDamage = Math.floor(unit.maxHP * 0.05);
          unit.currentHP = Math.max(1, unit.currentHP - burnDamage);
          
          this.logAction(
            unit, 
            unit, 
            'buff', 
            -burnDamage, 
            `${unit.name} 受到火焰地形伤害 ${burnDamage}`
          );
        }
      });
    }
  }

  applyTerrainEffects(unit: Unit): void {
    if (!this.state.environmentEffects) return;
    
    if (this.state.terrain.type === 'fire' && unit.type === 'Mage') {
      const burnDamage = Math.floor(unit.maxHP * 0.05);
      unit.currentHP = Math.max(1, unit.currentHP - burnDamage);
      
      this.logAction(
        unit, 
        unit, 
        'buff', 
        -burnDamage, 
        `${unit.name} 受到火焰地形伤害 ${burnDamage}`
      );
    }
  }

  getTerrainEffects(terrainType: TerrainType): Record<string, number> {
    switch (terrainType) {
      case 'forest':
        return {
          'Archer': 0.2,
          'Assassin': 0.15
        };
      case 'mountain':
        return {
          'Warrior': 0.15,
          'Knight': 0.1
        };
      case 'swamp':
        return {
          'Mage': 0.25,
          'Knight': -0.1
        };
      case 'fire':
        return {
          'Mage': 0.3
        };
      default:
        return {};
    }
  }

  setTerrain(terrainType: TerrainType): void {
    this.state.terrain = {
      type: terrainType,
      effects: this.getTerrainEffects(terrainType)
    };
  }
  
  getBattleLog(): BattleLogEntry[] {
    return [...this.state.log];
  }

  logAction(
    actor: Unit, 
    target: Unit, 
    action: ActionType, 
    value: number, 
    message: string,
    skillId?: string
  ): void {
    const logEntry: BattleLogEntry = {
      round: this.state.round,
      timestamp: Date.now(),
      actorId: actor.id,
      action,
      targetId: target.id,
      value,
      message,
      skillId
    };
    
    this.state.log.unshift(logEntry);
  }

  checkBattleEnd(): boolean {
    const alphaAlive = this.state.teams.alpha.some(unit => unit.currentHP > 0);
    const betaAlive = this.state.teams.beta.some(unit => unit.currentHP > 0);

    if (!alphaAlive || !betaAlive) {
      this.state.status = 'completed';
      this.state.winner = alphaAlive ? 'alpha' : 'beta';
      return true;
    }
    
    return false;
  }

  getState(): BattleState {
    return JSON.parse(JSON.stringify(this.state));
  }
}
