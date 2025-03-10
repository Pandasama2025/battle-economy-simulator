
import { Unit, BattleState, BattleLogEntry, ActionType } from '@/types/battle';

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
  initializeBattle(alphaTeam: Unit[], betaTeam: Unit[]): void {
    this.state.teams.alpha = alphaTeam;
    this.state.teams.beta = betaTeam;
    this.state.round = 0;
    this.state.status = 'preparing';
    this.state.log = [];
  }

  // 执行一个回合的战斗
  executeTurn(): void {
    if (this.state.status !== 'inProgress') {
      this.state.status = 'inProgress';
    }
    
    this.state.round++;
    const allUnits = [...this.state.teams.alpha, ...this.state.teams.beta]
      .sort((a, b) => b.speed - a.speed);

    for (const unit of allUnits) {
      if (unit.currentHP > 0) {
        this.executeUnitAction(unit);
      }
    }

    this.checkBattleEnd();
  }

  // 执行单位行动
  private executeUnitAction(unit: Unit): void {
    const targets = this.getValidTargets(unit);
    if (targets.length === 0) return;

    const target = this.selectTarget(targets);
    const action = this.determineAction(unit);
    
    this.performAction(unit, target, action);
  }

  // 获取有效目标
  private getValidTargets(unit: Unit): Unit[] {
    const enemyTeam = unit.team === 'alpha' ? this.state.teams.beta : this.state.teams.alpha;
    return enemyTeam.filter(target => target.currentHP > 0);
  }

  // 选择目标
  private selectTarget(targets: Unit[]): Unit {
    // 简单AI：选择生命值最低的目标
    return targets.reduce((lowest, current) => 
      current.currentHP < lowest.currentHP ? current : lowest
    );
  }

  // 决定行动类型
  private determineAction(unit: Unit): ActionType {
    if (unit.currentMana >= 50 && unit.skills.length > 0) {
      return 'skill';
    }
    return 'attack';
  }

  // 执行具体行动
  private performAction(attacker: Unit, target: Unit, action: ActionType): void {
    let damage = 0;
    
    if (action === 'attack') {
      damage = this.calculateDamage(attacker, target);
      target.currentHP = Math.max(0, target.currentHP - damage);
    } else if (action === 'skill' && attacker.skills.length > 0) {
      const skill = attacker.skills[0];
      damage = this.calculateSkillDamage(attacker, target, skill);
      target.currentHP = Math.max(0, target.currentHP - damage);
      attacker.currentMana -= skill.manaCost;
    }

    this.logAction(attacker, target, action, damage);
  }

  // 计算普通攻击伤害
  private calculateDamage(attacker: Unit, defender: Unit): number {
    const baseDamage = attacker.attack * (1 - defender.defense / 100);
    const isCrit = Math.random() < attacker.critRate;
    return Math.floor(isCrit ? baseDamage * attacker.critDamage : baseDamage);
  }

  // 计算技能伤害
  private calculateSkillDamage(attacker: Unit, defender: Unit, skill: any): number {
    const baseDamage = skill.damage + attacker.magicPower;
    return Math.floor(baseDamage * (1 - defender.magicResistance / 100));
  }

  // 记录战斗日志
  private logAction(attacker: Unit, target: Unit, action: ActionType, value: number): void {
    const logEntry: BattleLogEntry = {
      round: this.state.round,
      timestamp: Date.now(),
      actorId: attacker.id,
      action,
      targetId: target.id,
      value,
      message: `${attacker.name} ${action}s ${target.name} for ${value} damage`
    };
    
    this.state.log.unshift(logEntry);
  }

  // 检查战斗是否结束
  private checkBattleEnd(): void {
    const alphaAlive = this.state.teams.alpha.some(unit => unit.currentHP > 0);
    const betaAlive = this.state.teams.beta.some(unit => unit.currentHP > 0);

    if (!alphaAlive || !betaAlive) {
      this.state.status = 'completed';
      this.state.winner = alphaAlive ? 'alpha' : 'beta';
    }
  }

  // 获取当前战斗状态
  getState(): BattleState {
    return { ...this.state };
  }
}
