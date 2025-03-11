
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
