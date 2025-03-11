
import { BattleState } from '@/types/battle';
import { EconomyState, BalanceData } from '@/types/economy';

export class SimulationAnalyzer {
  private battleHistory: BattleState[] = [];
  private economyHistory: EconomyState[] = [];
  private autoAnalysisEnabled: boolean = false;
  private analysisInterval: number | null = null;
  private lastAnalysisTime: number = 0;
  private analysisCallback: ((data: BalanceData) => void) | null = null;

  // 添加战斗数据
  addBattleData(battleState: BattleState): void {
    this.battleHistory.push({ ...battleState });
    
    // 自动分析检查
    if (this.autoAnalysisEnabled) {
      this.checkAndTriggerAnalysis();
    }
  }

  // 添加经济数据
  addEconomyData(economyState: EconomyState): void {
    this.economyHistory.push({ ...economyState });
    
    // 自动分析检查
    if (this.autoAnalysisEnabled) {
      this.checkAndTriggerAnalysis();
    }
  }

  // 启用自动分析
  enableAutoAnalysis(intervalMs: number = 5000, callback?: (data: BalanceData) => void): void {
    this.autoAnalysisEnabled = true;
    this.analysisCallback = callback || null;
    
    // 清除之前的定时器
    if (this.analysisInterval !== null) {
      clearInterval(this.analysisInterval);
    }
    
    // 设置新的定时分析
    if (typeof window !== 'undefined') {
      this.analysisInterval = window.setInterval(() => {
        const report = this.generateBalanceReport();
        if (this.analysisCallback) {
          this.analysisCallback(report);
        }
      }, intervalMs);
    }
    
    console.log(`自动分析已启用，间隔: ${intervalMs}ms`);
  }

  // 禁用自动分析
  disableAutoAnalysis(): void {
    this.autoAnalysisEnabled = false;
    
    if (this.analysisInterval !== null && typeof window !== 'undefined') {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    
    console.log('自动分析已禁用');
  }

  // 检查是否需要触发分析
  private checkAndTriggerAnalysis(): void {
    const now = Date.now();
    // 至少有5条数据且距离上次分析至少过去了3秒
    if (
      (this.battleHistory.length >= 5 || this.economyHistory.length >= 5) && 
      (now - this.lastAnalysisTime > 3000)
    ) {
      const report = this.generateBalanceReport();
      this.lastAnalysisTime = now;
      
      if (this.analysisCallback) {
        this.analysisCallback(report);
      }
    }
  }

  // 获取分析状态
  getAnalysisStatus(): { 
    enabled: boolean; 
    dataPoints: { battles: number; economy: number }; 
    lastAnalysis: number;
  } {
    return {
      enabled: this.autoAnalysisEnabled,
      dataPoints: {
        battles: this.battleHistory.length,
        economy: this.economyHistory.length
      },
      lastAnalysis: this.lastAnalysisTime
    };
  }

  // 清除历史数据
  clearHistory(): void {
    this.battleHistory = [];
    this.economyHistory = [];
    this.lastAnalysisTime = 0;
    console.log('分析历史数据已清除');
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

  // 获取智能推荐
  getBalanceRecommendations(): {
    unitAdjustments: Array<{ unitType: string; issue: string; recommendation: string }>;
    economyAdjustments: Array<{ parameter: string; issue: string; recommendation: string }>;
    balanceScore: number;
  } {
    const unitWinRates = this.analyzeUnitWinRates();
    const { itemUsage } = this.analyzeEconomyTrends();
    const comebackRate = this.calculateComebackRate();
    
    const unitAdjustments: Array<{ unitType: string; issue: string; recommendation: string }> = [];
    let balanceScore = 100; // 满分100

    // 分析单位平衡性
    Object.entries(unitWinRates).forEach(([unitType, winRate]) => {
      if (winRate > 0.6) {
        unitAdjustments.push({
          unitType,
          issue: `胜率过高 (${(winRate * 100).toFixed(1)}%)`,
          recommendation: '降低攻击力或生命值，或提高技能冷却时间'
        });
        balanceScore -= 5;
      } else if (winRate < 0.4) {
        unitAdjustments.push({
          unitType,
          issue: `胜率过低 (${(winRate * 100).toFixed(1)}%)`,
          recommendation: '提高攻击力或生命值，或降低技能冷却时间'
        });
        balanceScore -= 5;
      }
    });

    // 分析经济平衡性
    const economyAdjustments: Array<{ parameter: string; issue: string; recommendation: string }> = [];
    
    // 分析物品使用率
    const itemTotal = Object.values(itemUsage).reduce((sum, count) => sum + count, 0);
    if (itemTotal > 0) {
      Object.entries(itemUsage).forEach(([itemId, count]) => {
        const usageRate = count / itemTotal;
        if (usageRate > 0.3) {
          economyAdjustments.push({
            parameter: `物品 ${itemId}`,
            issue: `使用率过高 (${(usageRate * 100).toFixed(1)}%)`,
            recommendation: '提高物品价格或降低物品效果'
          });
          balanceScore -= 3;
        } else if (usageRate < 0.05 && count > 0) {
          economyAdjustments.push({
            parameter: `物品 ${itemId}`,
            issue: `使用率过低 (${(usageRate * 100).toFixed(1)}%)`,
            recommendation: '降低物品价格或提高物品效果'
          });
          balanceScore -= 2;
        }
      });
    }

    // 分析翻盘率
    if (comebackRate < 0.1) {
      economyAdjustments.push({
        parameter: '翻盘机制',
        issue: `翻盘率过低 (${(comebackRate * 100).toFixed(1)}%)`,
        recommendation: '增加落后方的额外金币奖励或强化道具掉落'
      });
      balanceScore -= 10;
    } else if (comebackRate > 0.4) {
      economyAdjustments.push({
        parameter: '翻盘机制',
        issue: `翻盘率过高 (${(comebackRate * 100).toFixed(1)}%)`,
        recommendation: '减少落后方的额外金币奖励或平衡前期优势'
      });
      balanceScore -= 5;
    }

    // 确保平衡分数在合理范围内
    balanceScore = Math.max(0, Math.min(100, balanceScore));

    return {
      unitAdjustments,
      economyAdjustments,
      balanceScore
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
