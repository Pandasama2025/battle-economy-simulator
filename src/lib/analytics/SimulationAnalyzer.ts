
import { BattleState } from '@/types/battle';
import { EconomyState, BalanceData } from '@/types/economy';

export class SimulationAnalyzer {
  private battleHistory: BattleState[] = [];
  private economyHistory: EconomyState[] = [];

  // 添加战斗数据
  addBattleData(battleState: BattleState): void {
    this.battleHistory.push({ ...battleState });
  }

  // 添加经济数据
  addEconomyData(economyState: EconomyState): void {
    this.economyHistory.push({ ...economyState });
  }

  // 分析单位胜率
  analyzeUnitWinRates(): Record<string, number> {
    const unitStats: Record<string, { wins: number; total: number }> = {};

    this.battleHistory.forEach(battle => {
      const winner = battle.winner;
      if (!winner) return;

      const winningTeam = battle.teams[winner];
      const losingTeam = battle.teams[winner === 'alpha' ? 'beta' : 'alpha'];

      // 统计获胜方单位
      winningTeam.forEach(unit => {
        if (!unitStats[unit.type]) {
          unitStats[unit.type] = { wins: 0, total: 0 };
        }
        unitStats[unit.type].wins++;
        unitStats[unit.type].total++;
      });

      // 统计失败方单位
      losingTeam.forEach(unit => {
        if (!unitStats[unit.type]) {
          unitStats[unit.type] = { wins: 0, total: 0 };
        }
        unitStats[unit.type].total++;
      });
    });

    // 计算胜率
    return Object.entries(unitStats).reduce((rates, [type, stats]) => ({
      ...rates,
      [type]: stats.wins / stats.total
    }), {});
  }

  // 分析经济趋势
  analyzeEconomyTrends(): {
    averageGoldPerRound: number[];
    itemUsage: Record<string, number>;
    compositionDiversity: number;
  } {
    const averageGoldPerRound: number[] = [];
    const itemUsage: Record<string, number> = {};
    let compositionDiversity = 0;

    this.economyHistory.forEach(state => {
      // 计算平均金币
      const avgGold = state.players.reduce((sum, p) => sum + p.gold, 0) / state.players.length;
      averageGoldPerRound.push(avgGold);

      // 统计物品使用情况
      state.players.forEach(player => {
        player.items.forEach(item => {
          itemUsage[item.itemId] = (itemUsage[item.itemId] || 0) + 1;
        });
      });

      // 计算阵容多样性
      const compositions = new Set(state.players.map(p => 
        p.units.map(u => u.unitId).sort().join(',')
      ));
      compositionDiversity = compositions.size / state.players.length;
    });

    return {
      averageGoldPerRound,
      itemUsage,
      compositionDiversity
    };
  }

  // 获取平衡性报告
  generateBalanceReport(): BalanceData {
    const unitWinRates = this.analyzeUnitWinRates();
    const { averageGoldPerRound, itemUsage, compositionDiversity } = this.analyzeEconomyTrends();
    
    // 计算翻盘率
    const comebackRate = this.calculateComebackRate();
    
    // 计算经济影响力
    const economyImpact = this.calculateEconomyImpact();
    
    // 计算平均战斗时长
    const averageBattleDuration = this.calculateAverageBattleDuration();
    
    // 分析热门阵容
    const topCompositions = this.analyzeTopCompositions();

    return {
      unitWinRates,
      itemUsage,
      averageGoldPerRound,
      compositionDiversity,
      comebackRate,
      economyImpact,
      averageBattleDuration,
      topCompositions
    };
  }

  // 计算翻盘率
  private calculateComebackRate(): number {
    let comebacks = 0;
    let totalMatches = 0;

    this.battleHistory.forEach(battle => {
      if (battle.status === 'completed' && battle.log.length > 0) {
        totalMatches++;
        // 简单判断: 如果战斗过程中领先方发生过改变，则视为翻盘
        const earlyLeader = battle.log[battle.log.length - 1].actorId;
        const winner = battle.winner;
        if (winner && earlyLeader && battle.teams[winner].every(u => u.id !== earlyLeader)) {
          comebacks++;
        }
      }
    });

    return totalMatches > 0 ? comebacks / totalMatches : 0;
  }

  // 计算经济影响力
  private calculateEconomyImpact(): number {
    if (this.economyHistory.length < 2) return 0;

    let impactScore = 0;
    for (let i = 1; i < this.economyHistory.length; i++) {
      const prev = this.economyHistory[i - 1];
      const curr = this.economyHistory[i];
      
      // 计算金币变化的标准差
      const goldChanges = curr.players.map((player, idx) => 
        player.gold - prev.players[idx].gold
      );
      
      const avgChange = goldChanges.reduce((sum, val) => sum + val, 0) / goldChanges.length;
      const variance = goldChanges.reduce((sum, val) => sum + Math.pow(val - avgChange, 2), 0) / goldChanges.length;
      
      impactScore += Math.sqrt(variance) / avgChange;
    }

    return impactScore / (this.economyHistory.length - 1);
  }

  // 计算平均战斗时长
  private calculateAverageBattleDuration(): number {
    const durations = this.battleHistory.map(battle => {
      if (battle.log.length < 2) return 0;
      const start = battle.log[battle.log.length - 1].timestamp;
      const end = battle.log[0].timestamp;
      return (end - start) / 1000; // 转换为秒
    }).filter(duration => duration > 0);

    return durations.length > 0 
      ? durations.reduce((sum, val) => sum + val, 0) / durations.length 
      : 0;
  }

  // 分析热门阵容
  private analyzeTopCompositions(): {
    units: string[];
    winRate: number;
    playRate: number;
  }[] {
    const compositions: Record<string, { wins: number; total: number }> = {};

    this.battleHistory.forEach(battle => {
      ['alpha', 'beta'].forEach(team => {
        const comp = battle.teams[team as 'alpha' | 'beta']
          .map(u => u.type)
          .sort()
          .join(',');

        if (!compositions[comp]) {
          compositions[comp] = { wins: 0, total: 0 };
        }
        compositions[comp].total++;
        
        if (battle.winner === team) {
          compositions[comp].wins++;
        }
      });
    });

    const totalGames = this.battleHistory.length * 2;
    
    return Object.entries(compositions)
      .map(([comp, stats]) => ({
        units: comp.split(','),
        winRate: stats.wins / stats.total,
        playRate: stats.total / totalGames
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
  }
}
