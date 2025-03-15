import { SimulationResult, AdvancedOptimizationConfig } from '@/types/balance';
import { BattleConfiguration } from '@/types/battle';
import { EconomyConfiguration } from '@/types/economy';

export interface OptimizationEngineConfiguration extends AdvancedOptimizationConfig {
  randomSeed?: number;
}

export class OptimizationEngine {
  private config: OptimizationEngineConfiguration;
  private simulationResults: SimulationResult[] = [];
  private bestScore: number = 0;
  private bestParams: Record<string, number> = {};
  private iterationCount: number = 0;
  private startTime: number = 0;
  private stopSignal: boolean = false;
  
  constructor(config: OptimizationEngineConfiguration) {
    this.config = config;
  }
  
  public getSimulationResults(): SimulationResult[] {
    return this.simulationResults;
  }
  
  public stop(): void {
    this.stopSignal = true;
  }
  
  private shouldStop(): boolean {
    return this.stopSignal;
  }
  
  public async optimize(
    initialParams: Record<string, number>,
    paramRanges: Record<string, [number, number]>,
    evaluateParameters: (params: Record<string, number>) => Promise<number>,
    progressCallback?: (progress: number, bestScore: number) => void
  ): Promise<SimulationResult> {
    this.simulationResults = [];
    this.bestScore = 0;
    this.bestParams = { ...initialParams };
    this.iterationCount = 0;
    this.startTime = Date.now();
    this.stopSignal = false;
    
    let bestResult: SimulationResult = {
      params: { ...initialParams },
      balanceScore: 0,
      winRates: {},
      economyMetrics: {},
      metadata: {}
    };
    
    const maxTrials = this.config.configuration.maxTrials || 20;
    const iterationsPerTrial = this.config.configuration.iterationsPerTrial || 10;
    const explorationWeight = this.config.configuration.explorationWeight || 0.3;
    const learningRate = this.config.configuration.learningRate || 0.05;
    const regularizationStrength = this.config.configuration.regularizationStrength || 0.01;
    const convergenceTolerance = this.config.configuration.convergenceTolerance || 0.001;
    const earlyStopping = this.config.configuration.earlyStopping || true;
    
    let currentParams = { ...initialParams };
    let bestScore = 0;
    let lastImprovement = Date.now();
    
    for (let trial = 0; trial < maxTrials; trial++) {
      if (this.shouldStop()) break;
      
      for (let iteration = 0; iteration < iterationsPerTrial; iteration++) {
        if (this.shouldStop()) break;
        
        this.iterationCount++;
        
        // Explore or Exploit
        if (Math.random() < explorationWeight) {
          // Exploration: Randomly adjust parameters
          Object.keys(paramRanges).forEach(param => {
            const [min, max] = paramRanges[param];
            currentParams[param] = min + Math.random() * (max - min);
          });
        } else {
          // Exploitation: Adjust parameters based on gradient
          Object.keys(paramRanges).forEach(param => {
            const [min, max] = paramRanges[param];
            const gradient = this.calculateGradient(currentParams, param, evaluateParameters);
            currentParams[param] += learningRate * gradient - regularizationStrength * currentParams[param];
            currentParams[param] = Math.max(min, Math.min(max, currentParams[param])); // Clamp
          });
        }
        
        // Add a deterministic test seed
        if (this.config.randomSeed) {
          currentParams['_testSeed'] = this.generateSeededRandom(this.config.randomSeed + this.iterationCount);
        }
        
        // Evaluate parameters
        const score = await evaluateParameters(currentParams);
        
        // Collect simulation result
        const result: SimulationResult = {
          params: { ...currentParams },
          balanceScore: score,
          winRates: {},
          economyMetrics: {},
          metadata: {
            trial: trial,
            iteration: iteration,
            iterationCount: this.iterationCount,
            elapsedTime: Date.now() - this.startTime
          }
        };
        
        this.simulationResults.push(result);
        
        // Update best score
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
          this.bestParams = { ...currentParams };
          this.bestScore = score;
          lastImprovement = Date.now();
        }
        
        // Progress callback
        if (progressCallback) {
          progressCallback((trial * iterationsPerTrial + iteration) / (maxTrials * iterationsPerTrial), bestScore);
        }
      }
      
      // Early stopping check
      if (earlyStopping && Date.now() - lastImprovement > 5000) {
        console.log('Early stopping triggered');
        break;
      }
    }
    
    return bestResult;
  }
  
  private calculateGradient(
    params: Record<string, number>,
    paramName: string,
    evaluateParameters: (params: Record<string, number>) => Promise<number>
  ): number {
    const originalValue = params[paramName];
    const stepSize = originalValue * 0.01; // 1% step
    
    const paramsPlus = { ...params };
    paramsPlus[paramName] = originalValue + stepSize;
    
    const paramsMinus = { ...params };
    paramsMinus[paramName] = originalValue - stepSize;
    
    const scorePlusPromise = evaluateParameters(paramsPlus);
    const scoreMinusPromise = evaluateParameters(paramsMinus);
    
    return Promise.all([scorePlusPromise, scoreMinusPromise])
      .then(([scorePlus, scoreMinus]) => {
        return (scorePlus - scoreMinus) / (2 * stepSize);
      })
      .catch(error => {
        console.error("Error calculating gradient:", error);
        return 0;
      });
  }
  
  public generateBalanceReport(): any {
    if (this.simulationResults.length === 0) {
      return { message: "No simulation results available." };
    }
    
    const bestResult = this.simulationResults.reduce((prev, current) => (prev.balanceScore > current.balanceScore) ? prev : current);
    
    const report = {
      summary: {
        bestScore: bestResult.balanceScore,
        numIterations: this.simulationResults.length,
        elapsedTime: Date.now() - this.startTime
      },
      parameterAnalysis: this.analyzeParameterSensitivity(),
      scoreDistribution: this.calculateScoreDistribution(),
      winRateAnalysis: this.analyzeWinRates(),
      economyAnalysis: this.analyzeEconomyMetrics()
    };
    
    return report;
  }
  
  private analyzeParameterSensitivity(): any {
    const params = Object.keys(this.simulationResults[0]?.params || {});
    const sensitivities: Record<string, number[]> = {};
    
    params.forEach(param => {
      sensitivities[param] = [];
    });
    
    this.simulationResults.forEach(result => {
      params.forEach(param => {
        sensitivities[param].push(result.params[param] * result.balanceScore);
      });
    });
    
    return params.map(param => {
      const values = sensitivities[param];
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      return { name: param, value: average };
    }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }
  
  private calculateScoreDistribution(): any {
    const distribution: Record<string, number> = {};
    
    this.simulationResults.forEach(result => {
      const score = Math.floor(result.balanceScore / 10) * 10;
      const range = `${score}-${score + 10}`;
      distribution[range] = (distribution[range] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([range, count]) => ({ range, count }));
  }
  
  private analyzeWinRates(): any {
    const winRates: Record<string, number[]> = {};
    
    this.simulationResults.forEach(result => {
      Object.entries(result.winRates).forEach(([unit, rate]) => {
        if (!winRates[unit]) {
          winRates[unit] = [];
        }
        winRates[unit].push(rate);
      });
    });
    
    return Object.entries(winRates).map(([unit, rates]) => {
      const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      return { unit, averageWinRate: average };
    });
  }
  
  private analyzeEconomyMetrics(): any {
    const goldEfficiencies: number[] = [];
    const itemUtilizations: number[] = [];
    
    this.simulationResults.forEach(result => {
      goldEfficiencies.push(result.economyMetrics.goldEfficiency || 0);
      itemUtilizations.push(result.economyMetrics.itemUtilization || 0);
    });
    
    const avgGoldEfficiency = goldEfficiencies.reduce((sum, val) => sum + val, 0) / goldEfficiencies.length;
    const avgItemUtilization = itemUtilizations.reduce((sum, val) => sum + val, 0) / itemUtilizations.length;
    
    return {
      averageGoldEfficiency: avgGoldEfficiency,
      averageItemUtilization: avgItemUtilization
    };
  }
  
  private generateSeededRandom(seed: number): number {
    let _seed = seed;
    _seed = (_seed * 9301 + 49297) % 233280;
    return _seed / 233280;
  }

  private stringToNumericHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Ensure positive value and map to reasonable range for simulation
    return Math.abs(hash) % 10000 / 10000;
  }
}
