
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
  analyze(data: Record<string, any>, balanceParameters?: Record<string, number>): BalanceReport {
    const metrics: { [category: string]: BalanceMetric[] } = {};
    const warnings: { code: string; message: string; severity: number }[] = [];
    
    // 如果提供了平衡参数，记录到警告中以便查看
    if (balanceParameters) {
      Object.entries(balanceParameters).forEach(([key, value]) => {
        warnings.push({
          code: `PARAM_${key.toUpperCase()}`,
          message: `当前平衡参数 ${key} = ${value}`,
          severity: 0 // 信息级别
        });
      });
    }
    
    // 计算每个维度的得分
    for (const [category, metricsList] of Object.entries(this.BALANCE_METRICS_CONFIG)) {
      metrics[category] = metricsList.map(metric => {
        // 使用实际数据或生成模拟数据
        let value = data[metric.name];
        
        // 如果没有数据，根据参数生成模拟数据供参考
        if (value === undefined && balanceParameters) {
          value = this.generateMockMetricValue(metric.name, balanceParameters);
        } else if (value === undefined) {
          value = (metric.idealRange[0] + metric.idealRange[1]) / 2; // 默认值
        }
        
        const score = this.calculateScore(value, metric.idealRange as [number, number]);
        
        // 检查是否需要触发警告
        if (score < 0.5) {
          warnings.push({
            code: `${category.toUpperCase()}_${metric.name.toUpperCase()}_LOW`,
            message: `${metric.name} 严重失衡 (评分: ${score.toFixed(2)})`,
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
  
  // 根据平衡参数生成模拟的指标值
  private generateMockMetricValue(metricName: string, params: Record<string, number>): number {
    // 基于不同的指标名称和参数生成合理的模拟值
    switch (metricName) {
      case "avgRoundTime":
        return 25 + params.physicalDefense * 100; // 物理防御影响回合时长
      case "burstDamageRatio":
        return 0.3 + params.criticalRate / 2; // 暴击率影响爆发伤害比例
      case "tankSurvivalRate":
        return 0.5 - params.physicalDefense * 2; // 物理防御反向影响坦克生存率
      case "dpsEfficiency":
        return 0.7 - params.magicResistance * 3; // 魔法抗性反向影响DPS效率
      case "goldLeadImpact":
        return 0.4 + params.goldScaling / 10; // 金币缩放影响经济领先效果
      case "comebackPossibility":
        return 0.25 - params.interestRate; // 利率反向影响翻盘可能性
      case "resourceDistribution":
        return 0.5 + params.goldScaling / 10; // 金币缩放影响资源分配
      case "inflationRate":
        return 0.1 + params.interestRate / 2; // 利率影响通货膨胀率
      case "compWinRateStd":
        return 0.1 + params.criticalRate / 3; // 暴击率影响阵容胜率标准差
      case "itemUsageEntropy":
        return 0.8 - params.physicalDefense; // 物理防御反向影响装备使用熵
      case "strategyVariety":
        return 0.6 + params.healingEfficiency / 5; // 治疗效率影响策略多样性
      case "metaDynamism":
        return 0.45 + params.goldScaling / 10; // 金币缩放影响元数据动态性
      default:
        return 0.5; // 默认中间值
    }
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
    
    return totalWeight > 0 ? weightedSum / totalWeight * 100 : 0; // 转换为0-100分
  }
  
  // 检查特殊警告规则
  private checkSpecialWarnings(data: Record<string, any>, warnings: { code: string; message: string; severity: number }[]): void {
    // 检查顶级组合胜率过高
    if (data.topCompWinrate && data.topCompWinrate > 0.65) {
      warnings.push({
        code: 'COMP_IMBALANCE',
        message: `顶级阵容胜率过高 (${(data.topCompWinrate * 100).toFixed(1)}%)`,
        severity: 2
      });
    }
    
    // 检查经济曲线稳定性
    if (data.goldCurveRSquared && data.goldCurveRSquared < 0.3) {
      warnings.push({
        code: 'ECON_UNSTABLE',
        message: '经济增长曲线过于不稳定',
        severity: 1
      });
    }
  }
  
  // 生成平衡建议
  generateRecommendations(report: BalanceReport, currentParams: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    // 根据警告生成建议
    report.warnings.forEach(warning => {
      if (warning.severity > 0) { // 只处理严重性大于0的警告
        switch (warning.code) {
          case 'COMBAT_AVG_ROUND_TIME_LOW':
            recommendations.push('增加 physicalDefense 或 magicResistance 参数以延长战斗回合');
            break;
          case 'COMBAT_BURST_DAMAGE_RATIO_LOW':
            recommendations.push('降低 criticalRate 或 critDamage 参数以减少爆发伤害');
            break;
          case 'COMBAT_TANK_SURVIVAL_RATE_LOW':
            recommendations.push('增加坦克单位的基础生命值或防御值');
            break;
          case 'COMBAT_DPS_EFFICIENCY_LOW':
            recommendations.push('降低 magicResistance 参数以提高法术伤害效率');
            break;
          case 'ECONOMY_GOLD_LEAD_IMPACT_LOW':
            recommendations.push('增加 goldScaling 参数以增强经济领先优势');
            break;
          case 'ECONOMY_COMEBACK_POSSIBILITY_LOW':
            recommendations.push('降低 interestRate 参数以增加翻盘可能性');
            break;
          case 'DIVERSITY_COMP_WIN_RATE_STD_LOW':
            recommendations.push('调整不同阵容之间的平衡性，确保没有过于强力的阵容');
            break;
          default:
            // 对于其他警告，生成通用建议
            if (warning.code.startsWith('COMBAT_')) {
              recommendations.push('调整战斗相关参数以优化战斗体验');
            } else if (warning.code.startsWith('ECONOMY_')) {
              recommendations.push('调整经济相关参数以优化资源获取和使用');
            } else if (warning.code.startsWith('DIVERSITY_')) {
              recommendations.push('增加游戏内容多样性，确保多种策略都有效');
            }
        }
      }
    });
    
    // 移除重复建议
    return [...new Set(recommendations)];
  }
}
