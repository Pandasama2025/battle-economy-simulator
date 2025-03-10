
// 性能监控系统

interface ResourceUsage {
  cpuLoad: number;        // CPU使用率
  memUsage: number;       // 内存使用率
  simSpeed: number;       // 模拟速度（帧数/实际时间）
  renderTime: number;     // 渲染时间（毫秒）
  logicTime: number;      // 逻辑计算时间（毫秒）
  timestamp: number;      // 时间戳
}

export class PerformanceMonitor {
  private samples: ResourceUsage[] = [];
  private maxSamples = 100;  // 最大样本数
  private frameCount = 0;
  private lastFrameTime = 0;
  private startTime = 0;
  
  private renderTimes: number[] = [];
  private logicTimes: number[] = [];
  
  constructor() {
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
  }
  
  // 跟踪帧数
  frameRendered(): void {
    this.frameCount++;
    const now = performance.now();
    
    // 每秒记录一次资源使用
    if (now - this.lastFrameTime >= 1000) {
      this.trackResources(now);
      this.lastFrameTime = now;
    }
  }
  
  // 记录渲染时间
  recordRenderTime(timeMs: number): void {
    this.renderTimes.push(timeMs);
    // 保留最近100个样本
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }
  }
  
  // 记录逻辑计算时间
  recordLogicTime(timeMs: number): void {
    this.logicTimes.push(timeMs);
    // 保留最近100个样本
    if (this.logicTimes.length > 100) {
      this.logicTimes.shift();
    }
  }
  
  // 跟踪资源使用
  private trackResources(now: number): void {
    // 计算每秒帧数
    const fps = this.frameCount / ((now - this.lastFrameTime) / 1000);
    
    // 计算平均渲染时间
    const avgRenderTime = this.renderTimes.length > 0
      ? this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length
      : 0;
    
    // 计算平均逻辑时间
    const avgLogicTime = this.logicTimes.length > 0
      ? this.logicTimes.reduce((sum, time) => sum + time, 0) / this.logicTimes.length
      : 0;
    
    // 由于无法在浏览器中直接获取系统CPU/内存使用率，
    // 这里使用模拟值或性能相关替代指标
    const memoryInfo = (performance as any).memory?.usedJSHeapSize || 0;
    const totalHeapSize = (performance as any).memory?.totalJSHeapSize || 1;
    
    // 记录资源使用数据
    const usage: ResourceUsage = {
      cpuLoad: avgRenderTime + avgLogicTime, // 使用渲染+逻辑时间作为CPU负载指标
      memUsage: memoryInfo / totalHeapSize,  // JS堆内存使用率
      simSpeed: fps,                         // 帧率作为模拟速度
      renderTime: avgRenderTime,
      logicTime: avgLogicTime,
      timestamp: now
    };
    
    this.samples.push(usage);
    
    // 限制样本数量
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    
    // 重置帧计数
    this.frameCount = 0;
    this.renderTimes = [];
    this.logicTimes = [];
  }
  
  // 获取当前资源使用情况
  getCurrentResourceUsage(): ResourceUsage | null {
    return this.samples.length > 0 ? this.samples[this.samples.length - 1] : null;
  }
  
  // 获取历史数据
  getHistoricalData(): ResourceUsage[] {
    return [...this.samples];
  }
  
  // 检测性能瓶颈
  detectBottlenecks(): { type: string, severity: number, message: string }[] {
    const bottlenecks = [];
    
    if (this.samples.length < 2) return bottlenecks;
    
    // 获取最近的几个样本
    const recentSamples = this.samples.slice(-10);
    
    // 计算平均帧率
    const avgFps = recentSamples.reduce((sum, s) => sum + s.simSpeed, 0) / recentSamples.length;
    
    // 检测帧率问题
    if (avgFps < 20) {
      bottlenecks.push({
        type: 'LOW_FRAMERATE',
        severity: avgFps < 10 ? 3 : 2,
        message: `Low frame rate detected: ${avgFps.toFixed(1)} FPS`
      });
    }
    
    // 检测渲染时间过长
    const avgRenderTime = recentSamples.reduce((sum, s) => sum + s.renderTime, 0) / recentSamples.length;
    if (avgRenderTime > 16) { // 60fps要求每帧不超过16.67ms
      bottlenecks.push({
        type: 'RENDER_BOTTLENECK',
        severity: avgRenderTime > 33 ? 3 : 2,
        message: `High render time: ${avgRenderTime.toFixed(1)}ms (target: <16ms)`
      });
    }
    
    // 检测逻辑计算时间过长
    const avgLogicTime = recentSamples.reduce((sum, s) => sum + s.logicTime, 0) / recentSamples.length;
    if (avgLogicTime > 10) {
      bottlenecks.push({
        type: 'LOGIC_BOTTLENECK',
        severity: avgLogicTime > 20 ? 3 : 2,
        message: `High logic computation time: ${avgLogicTime.toFixed(1)}ms`
      });
    }
    
    // 检测内存使用过高
    const avgMemUsage = recentSamples.reduce((sum, s) => sum + s.memUsage, 0) / recentSamples.length;
    if (avgMemUsage > 0.8) { // 80%内存使用
      bottlenecks.push({
        type: 'HIGH_MEMORY_USAGE',
        severity: avgMemUsage > 0.9 ? 3 : 2,
        message: `High memory usage: ${(avgMemUsage * 100).toFixed(1)}%`
      });
    }
    
    return bottlenecks;
  }
}
