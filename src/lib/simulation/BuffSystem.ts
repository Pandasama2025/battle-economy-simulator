
// Buff系统实现
export interface Buff {
  id: string;
  name: string;
  type: "positive" | "negative";
  source: string; // 来源ID
  power: number;
  duration: number;
  stackable: boolean;
  effects: {
    [key: string]: number; // 影响的属性和数值
  };
}

export class BuffStackManager {
  private buffs: Buff[] = [];

  addBuff(newBuff: Buff): void {
    // 检查是否有来自相同来源的buff
    const existingIndex = this.buffs.findIndex(
      (b) => b.source === newBuff.source && b.name === newBuff.name
    );

    if (existingIndex >= 0 && this.buffs[existingIndex].stackable) {
      // 相同来源的buff更新
      const existing = this.buffs[existingIndex];
      existing.duration = Math.max(existing.duration, newBuff.duration);
      existing.power *= 1.2; // 叠加增强效果
      
      // 更新效果值
      Object.keys(existing.effects).forEach(key => {
        existing.effects[key] *= 1.2;
      });
    } else if (existingIndex >= 0) {
      // 不可叠加但来源相同，则刷新持续时间
      this.buffs[existingIndex].duration = newBuff.duration;
    } else {
      // 新增buff
      this.buffs.push(newBuff);
    }
  }

  // 获取所有激活的buff
  getActiveBuffs(): Buff[] {
    return this.buffs.filter((buff) => buff.duration > 0);
  }

  // 应用buff效果到单位属性
  applyBuffEffects(baseStats: Record<string, number>): Record<string, number> {
    const modifiedStats = { ...baseStats };
    
    this.getActiveBuffs().forEach(buff => {
      Object.entries(buff.effects).forEach(([stat, value]) => {
        if (modifiedStats[stat] !== undefined) {
          modifiedStats[stat] += value;
        }
      });
    });
    
    return modifiedStats;
  }

  // 更新所有buff的持续时间
  updateBuffs(): void {
    // 减少所有buff的持续时间
    this.buffs.forEach(buff => {
      buff.duration -= 1;
    });
    
    // 移除已过期的buff
    this.buffs = this.buffs.filter(buff => buff.duration > 0);
  }
}
