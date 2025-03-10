
// 平衡性分析器 - 负责评估和诊断系统平衡性

export type BalanceMetric = {
  name: string;
  value: number;
  idealRange: [number, number];
  score: number;
  weight: number;
};

export type BalanceReport = {
  overallScore: number;
  metrics: {
    [category: string]: BalanceMetric[];
  };
  warnings: {
    code: string;
    message: string;
    severity: number;
  }[];
};

export class BalanceAnalyzer {
  // 平衡性评估维度
  private readonly BALANCE_METRICS_CONFIG = {
    "combat": [
      { name: "avgRoundTime", idealRange: [20, 40] as [number, number], weight: 1.0 },
      { name: "burstDamageRatio", idealRange: [0.2, 0.4] as [number, number], weight: 0.8 },
      { name: "tankSurvivalRate", idealRange: [0.4, 0.6] as [number, number], weight: 0.7 },
      { name: "dpsEfficiency", idealRange: [0.6, 0.8] as [number, number], weight: 0.9 },
    ],
    "economy": [
      { name: "goldLeadImpact", idealRange: [0.3, 0.5] as [number, number], weight: 1.0 },
      { name: "comebackPossibility", idealRange: [0.2, 0.3] as [number, number], weight: 0.9 },
      { name: "resourceDistribution", idealRange: [0.4, 0.6] as [number, number], weight: 0.7 },
      { name: "inflationRate", idealRange: [0.05, 0.15] as [number, number], weight: 0.8 },
    ],
    "diversity": [
      { name: "compWinRateStd", idealRange: [0.05, 0.15] as [number, number], weight: 1.0 },
      { name: "itemUsageEntropy", idealRange: [0.7, 0.9] as [number, number], weight: 0.7 },
      { name: "strategyVariety", idealRange: [0.5, 0.8] as [number, number], weight: 0.9 },
      { name: "metaDynamism", idealRange: [0.3, 0.6] as [number, number], weight: 0.8 },
    ]
  };
  
  // 检查并返回平衡分析报告
  analyze(data: Record<string, any>): BalanceReport {
    const metrics: { [category: string]: BalanceMetric[] } = {};
    const warnings: { code: string; message: string; severity: number }[] = [];
    
    // 计算每个维度的得分
    for (const [category, metricsList] of Object.entries(this.BALANCE_METRICS_CONFIG)) {
      metrics[category] = metricsList.map(metric => {
        const value = data[metric.name] || 0;
        const score = this.calculateScore(value, metric.idealRange as [number, number]);
        
        // 检查是否需要触发警告
        if (score < 0.5) {
          warnings.push({
            code: `${category.toUpperCase()}_${metric.name.toUpperCase()}_LOW`,
            message: `${metric.name} is significantly out of balance (score: ${score.toFixed(2)})`,
            severity: score < 0.3 ? 2 : 1
          });
        }
        
        return {
          name: metric.name,
          value,
          idealRange: metric.idealRange as [number, number],
          score,
          weight: metric.weight
        };
      });
    }
    
    // 附加特殊警告规则检查
    this.checkSpecialWarnings(data, warnings);
    
    // 计算总体得分
    const overallScore = this.calculateOverallScore(metrics);
    
    return {
      overallScore,
      metrics,
      warnings
    };
  }
  
  // 计算单个指标的得分
  private calculateScore(value: number, idealRange: [number, number]): number {
    const [min, max] = idealRange;
    
    // 完全在理想范围内
    if (value >= min && value <= max) {
      return 1.0;
    }
    
    // 计算与理想范围的距离
    const distance = value < min ? min - value : value - max;
    const rangeSize = max - min;
    
    // 根据距离衰减
    return Math.max(0, 1 - (distance / rangeSize));
  }
  
  // 计算总体平衡得分
  private calculateOverallScore(metrics: { [category: string]: BalanceMetric[] }): number {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const category of Object.values(metrics)) {
      for (const metric of category) {
        weightedSum += metric.score * metric.weight;
        totalWeight += metric.weight;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  // 检查特殊警告规则
  private checkSpecialWarnings(data: Record<string, any>, warnings: { code: string; message: string; severity: number }[]): void {
    // 检查顶级组合胜率过高
    if (data.topCompWinrate && data.topCompWinrate > 0.65) {
      warnings.push({
        code: 'COMP_IMBALANCE',
        message: `Top composition win rate is too high (${(data.topCompWinrate * 100).toFixed(1)}%)`,
        severity: 2
      });
    }
    
    // 检查经济曲线稳定性
    if (data.goldCurveRSquared && data.goldCurveRSquared < 0.3) {
      warnings.push({
        code: 'ECON_UNSTABLE',
        message: 'Economic progression is too unstable',
        severity: 1
      });
    }
  }
}
