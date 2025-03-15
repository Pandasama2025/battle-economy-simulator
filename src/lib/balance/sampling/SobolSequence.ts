
/**
 * 生成Sobol序列，用于均匀采样多维参数空间
 * 
 * Sobol序列是一种低差异序列，用于在多维空间中生成均匀分布的点，
 * 比纯随机采样更高效地覆盖参数空间
 */
export function generateSobolSequence(
  paramSpace: Record<string, [number, number]>, 
  numSamples: number
): Record<string, number>[] {
  // 获取参数维度
  const dimensions = Object.keys(paramSpace);
  const numDimensions = dimensions.length;
  
  // 创建结果数组
  const results: Record<string, number>[] = [];
  
  // 使用简化版的Sobol序列生成
  // 实际应用中可能需要更复杂的实现或使用第三方库
  for (let i = 0; i < numSamples; i++) {
    // 生成第i个样本
    const sample: Record<string, number> = {};
    
    // 使用修改后的VanDerCorput序列作为简化的Sobol序列
    for (let j = 0; j < numDimensions; j++) {
      const dimName = dimensions[j];
      const [min, max] = paramSpace[dimName];
      
      // 使用Gray码反射二进制数生成基于索引的低差异值
      let pos = reverseBits(i ^ (i >> 1)) / (1 << 30);
      
      // 优化：每个维度使用不同的位移，以减少相关性
      pos = (pos + (j * 0.1)) % 1.0;
      
      // 将[0,1]区间映射到参数范围
      sample[dimName] = min + pos * (max - min);
    }
    
    results.push(sample);
  }
  
  return results;
}

/**
 * 反转整数的二进制位
 * 用于生成Van Der Corput低差异序列
 */
function reverseBits(n: number): number {
  let result = 0;
  for (let i = 0; i < 30; i++) {
    result = (result << 1) | (n & 1);
    n >>= 1;
    if (n === 0) break;
  }
  return result;
}

/**
 * 生成拉丁超立方采样
 * 适用于高维参数空间的均匀采样
 */
export function generateLatinHypercubeSampling(
  paramSpace: Record<string, [number, number]>,
  numSamples: number
): Record<string, number>[] {
  const dimensions = Object.keys(paramSpace);
  const numDimensions = dimensions.length;
  const results: Record<string, number>[] = [];
  
  // 为每个维度创建一个划分好的区间
  const intervals: number[][] = [];
  
  for (let i = 0; i < numDimensions; i++) {
    const dimension = dimensions[i];
    const [min, max] = paramSpace[dimension];
    const range = max - min;
    
    // 将每个维度划分为numSamples个等间距区间
    const dimensionIntervals = [];
    for (let j = 0; j < numSamples; j++) {
      dimensionIntervals.push(min + (j * range) / numSamples);
    }
    
    // 随机打乱该维度的区间顺序
    shuffleArray(dimensionIntervals);
    intervals.push(dimensionIntervals);
  }
  
  // 生成样本
  for (let i = 0; i < numSamples; i++) {
    const sample: Record<string, number> = {};
    
    for (let j = 0; j < numDimensions; j++) {
      const dimension = dimensions[j];
      const [min, max] = paramSpace[dimension];
      const range = max - min;
      
      // 从该维度的第i个区间中随机选择一个值
      const intervalStart = intervals[j][i];
      const intervalWidth = range / numSamples;
      
      // 在区间内随机选择一点
      sample[dimension] = intervalStart + Math.random() * intervalWidth;
    }
    
    results.push(sample);
  }
  
  return results;
}

/**
 * 打乱数组顺序
 */
function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
