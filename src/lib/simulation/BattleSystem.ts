
import { Unit, BattleState, BattleLogEntry, ActionType, SkillEffect } from '@/types/battle';

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
        type: 'plains',
        effects: {}
      },
      log: []
    };
  }

  // 初始化战斗
  initializeBattle(alphaTeam: Unit[], betaTeam: Unit[], terrainType = 'plains'): void {
    this.state.teams.alpha = JSON.parse(JSON.stringify(alphaTeam)); // 深拷贝
    this.state.teams.beta = JSON.parse(JSON.stringify(betaTeam));   // 深拷贝
    this.state.round = 0;
    this.state.status = 'preparing';
    this.state.log = [];
    this.state.terrain = {
      type: terrainType,
      effects: this.getTerrainEffects(terrainType)
    };
    
    // 应用地形效果
    this.applyTerrainEffects();
  }

  // 执行一个回合的战斗
  executeTurn(): void {
    if (this.state.status !== 'inProgress') {
      this.state.status = 'inProgress';
    }
    
    this.state.round++;
    
    // 回合开始时恢复部分魔法值
    this.regenerateMana();
    
    // 根据速度排序决定行动顺序
    const allUnits = [...this.state.teams.alpha, ...this.state.teams.beta]
      .filter(unit => unit.currentHP > 0)
      .sort((a, b) => b.speed - a.speed);

    for (const unit of allUnits) {
      // 检查单位是否被眩晕
      if (unit.status === 'stunned') {
        unit.status = 'idle'; // 解除眩晕
        this.logAction(unit, unit, 'recover', 0, `${unit.name} 从眩晕中恢复`);
        continue;
      }
      
      // 只有活着的单位才能行动
      if (unit.currentHP > 0) {
        this.executeUnitAction(unit);
      }
      
      // 每次行动后检查战斗是否结束
      if (this.checkBattleEnd()) {
        break;
      }
    }
    
    // 回合结束时应用持续效果
    this.applyOverTimeEffects();
  }

  // 执行单位行动
  private executeUnitAction(unit: Unit): void {
    // 获取有效目标
    const targets = this.getValidTargets(unit);
    if (targets.length === 0) return;

    // 选择目标
    const target = this.selectTarget(unit, targets);
    
    // 决定行动类型
    const action = this.determineAction(unit);
    
    // 执行行动
    this.performAction(unit, target, action);
    
    // 减少技能冷却时间
    this.reduceCooldowns(unit);
  }

  // 获取有效目标
  private getValidTargets(unit: Unit): Unit[] {
    const enemyTeam = unit.team === 'alpha' ? this.state.teams.beta : this.state.teams.alpha;
    return enemyTeam.filter(target => target.currentHP > 0);
  }

  // 获取友方单位
  private getAllyTargets(unit: Unit): Unit[] {
    const allyTeam = unit.team === 'alpha' ? this.state.teams.alpha : this.state.teams.beta;
    return allyTeam.filter(target => target.id !== unit.id && target.currentHP > 0);
  }

  // 选择目标
  private selectTarget(attacker: Unit, targets: Unit[]): Unit {
    // 基础策略: 优先攻击血量低的目标
    // 如果攻击者是刺客类型，则优先攻击魔法师类型的单位
    if (attacker.type === 'Assassin') {
      const mageTargets = targets.filter(t => t.type === 'Mage');
      if (mageTargets.length > 0) {
        return mageTargets.reduce((lowest, current) => 
          current.currentHP < lowest.currentHP ? current : lowest
        );
      }
    }
    
    // 如果攻击者是牧师类型，则寻找需要治疗的友方
    if (attacker.type === 'Priest' && Math.random() > 0.5) {
      const allies = this.getAllyTargets(attacker);
      const woundedAllies = allies.filter(a => a.currentHP < a.maxHP * 0.7);
      
      if (woundedAllies.length > 0) {
        // 选择生命值百分比最低的友军
        return woundedAllies.reduce((mostWounded, current) => 
          (current.currentHP / current.maxHP) < (mostWounded.currentHP / mostWounded.maxHP) 
            ? current : mostWounded
        );
      }
    }
    
    // 默认选择生命值最低的目标
    return targets.reduce((lowest, current) => 
      current.currentHP < lowest.currentHP ? current : lowest
    );
  }

  // 决定行动类型
  private determineAction(unit: Unit): ActionType {
    // 治疗类优先使用治疗技能
    if (unit.type === 'Priest') {
      const woundedAllies = this.getAllyTargets(unit).filter(a => a.currentHP < a.maxHP * 0.7);
      if (woundedAllies.length > 0 && unit.currentMana >= 30) {
        return 'heal';
      }
    }
    
    // 检查是否有可用技能
    const availableSkills = unit.skills.filter(skill => 
      skill.manaCost <= unit.currentMana && skill.currentCooldown === 0
    );
    
    if (availableSkills.length > 0) {
      // 随机决定是否使用技能，高攻击单位更倾向于普通攻击
      const skillChance = unit.magicPower > unit.attack ? 0.7 : 0.4;
      if (Math.random() < skillChance) {
        return 'skill';
      }
    }
    
    // 商人类型有概率使用buff
    if (unit.type === 'Merchant' && Math.random() < 0.3 && unit.currentMana >= 20) {
      return 'buff';
    }
    
    // 低生命值单位有概率防御
    if (unit.currentHP < unit.maxHP * 0.3 && Math.random() < 0.4) {
      return 'defend';
    }
    
    // 默认使用普通攻击
    return 'attack';
  }

  // 执行具体行动
  private performAction(attacker: Unit, target: Unit, action: ActionType): void {
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

  // 执行普通攻击
  private performAttack(attacker: Unit, target: Unit): void {
    // 计算伤害
    const baseDamage = this.calculateDamage(attacker, target);
    const isCrit = Math.random() < attacker.critRate;
    const damage = Math.floor(isCrit ? baseDamage * attacker.critDamage : baseDamage);
    
    // 应用伤害
    target.currentHP = Math.max(0, target.currentHP - damage);
    
    // 记录攻击日志
    this.logAction(
      attacker, 
      target, 
      'attack', 
      damage, 
      isCrit 
        ? `${attacker.name} 暴击攻击 ${target.name}，造成 ${damage} 点伤害` 
        : `${attacker.name} 攻击 ${target.name}，造成 ${damage} 点伤害`
    );
    
    // 更新目标状态
    if (target.currentHP <= 0) {
      target.status = 'dead';
      this.logAction(attacker, target, 'attack', 0, `${target.name} 已被击败`);
    }
  }

  // 执行技能攻击
  private performSkill(attacker: Unit, target: Unit): void {
    // 选择一个可用技能
    const availableSkills = attacker.skills.filter(skill => 
      skill.manaCost <= attacker.currentMana && skill.currentCooldown === 0
    );
    
    if (availableSkills.length === 0) {
      // 如果没有可用技能，执行普通攻击
      this.performAttack(attacker, target);
      return;
    }
    
    // 选择威力最大的技能
    const skill = availableSkills.reduce((strongest, current) => 
      current.damage > strongest.damage ? current : strongest
    );
    
    // 计算技能伤害
    const damage = this.calculateSkillDamage(attacker, target, skill);
    
    // 应用伤害
    target.currentHP = Math.max(0, target.currentHP - damage);
    
    // 消耗魔法值
    attacker.currentMana -= skill.manaCost;
    
    // 设置技能冷却
    skill.currentCooldown = skill.cooldown;
    
    // 记录技能日志
    this.logAction(
      attacker, 
      target, 
      'skill', 
      damage, 
      `${attacker.name} 使用技能 ${skill.name} 对 ${target.name} 造成 ${damage} 点伤害`,
      skill.id
    );
    
    // 应用技能效果
    if (skill.effects && skill.effects.length > 0) {
      this.applySkillEffects(skill.effects, attacker, target);
    }
    
    // 更新目标状态
    if (target.currentHP <= 0) {
      target.status = 'dead';
      this.logAction(attacker, target, 'skill', 0, `${target.name} 已被击败`);
    }
  }

  // 执行防御动作
  private performDefend(unit: Unit): void {
    unit.status = 'defending';
    // 临时增加防御力
    const defenseBoost = Math.floor(unit.defense * 0.5);
    unit.defense += defenseBoost;
    
    // 记录防御日志
    this.logAction(
      unit, 
      unit, 
      'defend', 
      defenseBoost, 
      `${unit.name} 进入防御姿态，防御力提升 ${defenseBoost}`
    );
    
    // 在下一回合恢复正常防御力
    setTimeout(() => {
      if (unit.status === 'defending') {
        unit.defense -= defenseBoost;
        unit.status = 'idle';
      }
    }, 0);
  }

  // 执行治疗动作
  private performHeal(healer: Unit, target: Unit): void {
    const healAmount = Math.floor(healer.magicPower * 1.2);
    const oldHP = target.currentHP;
    
    // 应用治疗量
    target.currentHP = Math.min(target.maxHP, target.currentHP + healAmount);
    const actualHeal = target.currentHP - oldHP;
    
    // 消耗魔法值
    healer.currentMana -= 30;
    
    // 记录治疗日志
    this.logAction(
      healer, 
      target, 
      'heal', 
      actualHeal, 
      `${healer.name} 治疗 ${target.name}，恢复 ${actualHeal} 点生命值`
    );
  }

  // 执行增益动作
  private performBuff(caster: Unit, target: Unit): void {
    // 根据施法者类型应用不同的增益
    let buffAmount = 0;
    let buffType = '';
    
    if (caster.type === 'Merchant') {
      // 商人提高攻击力
      buffAmount = Math.floor(target.attack * 0.2);
      target.attack += buffAmount;
      buffType = '攻击力';
    } else if (caster.type === 'Priest') {
      // 牧师提高防御力
      buffAmount = Math.floor(target.defense * 0.2);
      target.defense += buffAmount;
      buffType = '防御力';
    } else {
      // 默认提高速度
      buffAmount = Math.floor(target.speed * 0.2);
      target.speed += buffAmount;
      buffType = '速度';
    }
    
    // 消耗魔法值
    caster.currentMana -= 20;
    
    // 记录增益日志
    this.logAction(
      caster, 
      target, 
      'buff', 
      buffAmount, 
      `${caster.name} 增强了 ${target.name} 的${buffType}，提升 ${buffAmount} 点`
    );
  }

  // 计算普通攻击伤害
  private calculateDamage(attacker: Unit, defender: Unit): number {
    const attackPower = attacker.attack;
    const defensePower = defender.defense;
    const penetration = Math.max(0, attackPower * 0.1);
    
    // 应用地形效果
    let terrainModifier = 1.0;
    if (this.state.terrain.effects[attacker.type]) {
      terrainModifier += this.state.terrain.effects[attacker.type];
    }
    
    // 基础伤害计算
    const baseDamage = (attackPower * terrainModifier) - (defensePower - penetration);
    
    // 确保最小伤害
    return Math.max(1, Math.floor(baseDamage));
  }

  // 计算技能伤害
  private calculateSkillDamage(attacker: Unit, defender: Unit, skill: any): number {
    const magicPower = attacker.magicPower;
    const resistance = defender.magicResistance;
    const penetration = Math.max(0, magicPower * 0.15);
    
    // 应用地形效果
    let terrainModifier = 1.0;
    if (this.state.terrain.effects[attacker.type]) {
      terrainModifier += this.state.terrain.effects[attacker.type];
    }
    
    // 基础伤害计算
    const baseDamage = ((skill.damage + magicPower) * terrainModifier) - (resistance - penetration);
    
    // 确保最小伤害
    return Math.max(5, Math.floor(baseDamage));
  }

  // 应用技能效果
  private applySkillEffects(effects: SkillEffect[], caster: Unit, target: Unit): void {
    effects.forEach(effect => {
      // 检查效果是否触发
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
          // 减益效果
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

  // 回合开始时恢复部分魔法值
  private regenerateMana(): void {
    const allUnits = [...this.state.teams.alpha, ...this.state.teams.beta];
    allUnits.forEach(unit => {
      if (unit.currentHP > 0) {
        const regenAmount = Math.floor(unit.maxMana * 0.1);
        unit.currentMana = Math.min(unit.maxMana, unit.currentMana + regenAmount);
      }
    });
  }

  // 减少技能冷却时间
  private reduceCooldowns(unit: Unit): void {
    unit.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  }

  // 应用持续效果
  private applyOverTimeEffects(): void {
    // 地形持续伤害等
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

  // 获取地形效果
  private getTerrainEffects(terrainType: string): Record<string, number> {
    switch (terrainType) {
      case 'forest':
        return {
          'Archer': 0.2,  // 弓箭手在森林中攻击力+20%
          'Assassin': 0.15  // 刺客在森林中攻击力+15%
        };
      case 'mountain':
        return {
          'Warrior': 0.15,  // 战士在山地攻击力+15%
          'Knight': 0.1  // 骑士在山地攻击力+10%
        };
      case 'swamp':
        return {
          'Mage': 0.25,  // 法师在沼泽地攻击力+25%
          'Knight': -0.1  // 骑士在沼泽地攻击力-10%
        };
      case 'fire':
        return {
          'Mage': 0.3  // 法师在火焰地形攻击力+30%
        };
      default:
        return {};
    }
  }

  // 应用地形效果
  private applyTerrainEffects(): void {
    // 未来可以扩展更多地形效果
  }

  // 记录战斗日志
  private logAction(
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

  // 检查战斗是否结束
  private checkBattleEnd(): boolean {
    const alphaAlive = this.state.teams.alpha.some(unit => unit.currentHP > 0);
    const betaAlive = this.state.teams.beta.some(unit => unit.currentHP > 0);

    if (!alphaAlive || !betaAlive) {
      this.state.status = 'completed';
      this.state.winner = alphaAlive ? 'alpha' : 'beta';
      return true;
    }
    
    return false;
  }

  // 获取当前战斗状态
  getState(): BattleState {
    return JSON.parse(JSON.stringify(this.state)); // 返回深拷贝
  }
  
  // 设置地形类型
  setTerrain(terrainType: string): void {
    this.state.terrain = {
      type: terrainType,
      effects: this.getTerrainEffects(terrainType)
    };
  }
  
  // 获取所有战斗日志
  getBattleLog(): BattleLogEntry[] {
    return [...this.state.log];
  }
}
