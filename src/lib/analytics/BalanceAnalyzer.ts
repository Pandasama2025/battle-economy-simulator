
// 平衡性分析系统

export interface BalanceMetric {
  name: string;
  category: "combat" | "economy" | "diversity";
  value: number;
  idealRange: [number, number]; // 理想范围
  weight: number; // 影响权重
}

// 平衡性诊断引擎
export class BalanceAnalyzer {
  private metrics: BalanceMetric[] = [];
  
  // 平衡性评估维度
  private readonly BALANCE_METRICS_CONFIG = {
    "combat": [
      { name: "avgRoundTime", idealRange: [20, 40], weight: 1.0 },
      { name: "burstDamageRatio", idealRange: [0.2, 0.4], weight: 0.8 },
      { name: "tankSurvivalRate", idealRange: [0.4, 0.6], weight: 0.7 },
      { name: "dpsEfficiency", idealRange: [0.6, 0.8], weight: 0.9 },
    ],
    "economy": [
      { name: "goldLeadImpact", idealRange: [0.3, 0.5], weight: 1.0 },
      { name: "comebackPossibility", idealRange: [0.2, 0.3], weight: 0.9 },
      { name: "resourceDistribution", idealRange: [0.4, 0.6], weight: 0.7 },
      { name: "inflationRate", idealRange: [0.05, 0.15], weight: 0.8 },
    ],
    "diversity": [
      { name: "compWinRateStd", idealRange: [0.05, 0.15], weight: 1.0 },
      { name: "itemUsageEntropy", idealRange: [0.7, 0.9], weight: 0.7 },
      { name: "strategyVariety", idealRange: [0.5, 0.8], weight: 0.9 },
      { name: "metaDynamism", idealRange: [0.3, 0.6], weight: 0.8 },
    ]
  };
  
  constructor() {
    // 初始化所有指标
    Object.entries(this.BALANCE_METRICS_CONFIG).forEach(([category, metricsList]) => {
      metricsList.forEach(config => {
        this.metrics.push({
          name: config.name,
          category: category as "combat" | "economy" | "diversity",
          value: 0, // 初始值
          idealRange: config.idealRange,
          weight: config.weight
        });
      });
    });
  }
  
  // 更新指标值
  updateMetric(name: string, value: number): void {
    const metric = this.metrics.find(m => m.name === name);
    if (metric) {
      metric.value = value;
    }
  }
  
  // 检查是否存在平衡性问题
  checkImbalances(): { alerts: Array<{ type: string; severity: number; message: string }> } {
    const alerts = [];
    
    // 检查各项指标
    this.metrics.forEach(metric => {
      const [min, max] = metric.idealRange;
      
      // 指标超出理想范围
      if (metric.value < min) {
        const severity = (min - metric.value) / min * 3; // 计算严重程度(1-3)
        alerts.push({
          type: `${metric.name.toUpperCase()}_LOW`,
          severity: Math.min(3, Math.ceil(severity)),
          message: `${metric.name} is too low (${metric.value.toFixed(2)}, ideal min: ${min})`
        });
      } else if (metric.value > max) {
        const severity = (metric.value - max) / max * 3; // 计算严重程度(1-3)
        alerts.push({
          type: `${metric.name.toUpperCase()}_HIGH`,
          severity: Math.min(3, Math.ceil(severity)),
          message: `${metric.name} is too high (${metric.value.toFixed(2)}, ideal max: ${max})`
        });
      }
    });
    
    // 特殊情况检查
    const topCompWinrate = this.getMetricValue("compWinRateStd") * 0.5 + 0.5; // 假设转换
    if (topCompWinrate > 0.65) {
      alerts.push({
        type: "COMP_IMBALANCE",
        severity: 2,
        message: `Top composition win rate too high: ${(topCompWinrate * 100).toFixed(1)}%`
      });
    }
    
    const goldCurveRSquared = this.getMetricValue("goldLeadImpact");
    if (goldCurveRSquared < 0.3) {
      alerts.push({
        type: "ECON_UNSTABLE",
        severity: 1,
        message: `Economy system unstable, R² value: ${goldCurveRSquared.toFixed(2)}`
      });
    }
    
    return { alerts };
  }
  
  // 获取指标当前值
  private getMetricValue(name: string): number {
    const metric = this.metrics.find(m => m.name === name);
    return metric ? metric.value : 0;
  }
  
  // 获取综合评分
  getBalanceScore(): { overall: number; byCategory: Record<string, number> } {
    const scores: Record<string, number[]> = {
      combat: [],
      economy: [],
      diversity: []
    };
    
    // 计算每个指标的得分
    this.metrics.forEach(metric => {
      const [min, max] = metric.idealRange;
      const ideal = (min + max) / 2;
      const range = max - min;
      
      // 计算与理想值的偏差，转换为0-1分数
      const deviation = Math.abs(metric.value - ideal) / (range / 2);
      const score = Math.max(0, 1 - deviation) * metric.weight;
      
      scores[metric.category].push(score);
    });
    
    // 计算每个类别的平均分
    const categoryScores = Object.keys(scores).reduce((obj, key) => {
      const values = scores[key];
      obj[key] = values.length > 0 
        ? values.reduce((sum, val) => sum + val, 0) / values.length 
        : 0;
      return obj;
    }, {} as Record<string, number>);
    
    // 计算总体分数
    const totalWeight = Object.values(this.BALANCE_METRICS_CONFIG)
      .flatMap(metrics => metrics)
      .reduce((sum, config) => sum + config.weight, 0);
    
    const weightedSum = this.metrics.reduce(
      (sum, metric) => {
        const [min, max] = metric.idealRange;
        const ideal = (min + max) / 2;
        const range = max - min;
        const deviation = Math.abs(metric.value - ideal) / (range / 2);
        const score = Math.max(0, 1 - deviation);
        return sum + score * metric.weight;
      }, 0);
    
    const overallScore = weightedSum / totalWeight;
    
    return {
      overall: overallScore,
      byCategory: categoryScores
    };
  }
}
