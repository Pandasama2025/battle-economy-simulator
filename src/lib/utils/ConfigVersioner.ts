
// 配置版本控制系统

interface ConfigVersion {
  timestamp: string;
  params: Record<string, any>;
  hash: string;
  comment: string;
}

export class ConfigVersioner {
  private history: ConfigVersion[] = [];
  
  constructor(private storageKey: string = 'sim-config-history') {
    this.loadHistory();
  }
  
  // 提交新的配置变更
  commitChange(params: Record<string, any>, comment: string): string {
    // 计算配置的哈希值
    const hash = this.generateHash(params);
    
    const version: ConfigVersion = {
      timestamp: new Date().toISOString(),
      params: { ...params },
      hash,
      comment
    };
    
    this.history.push(version);
    this.saveHistory();
    
    return hash;
  }
  
  // 获取所有配置历史
  getHistory(): ConfigVersion[] {
    return [...this.history];
  }
  
  // 根据哈希获取特定配置版本
  getVersion(hash: string): ConfigVersion | null {
    return this.history.find(version => version.hash === hash) || null;
  }
  
  // 获取最新配置
  getLatestConfig(): Record<string, any> | null {
    if (this.history.length === 0) return null;
    return { ...this.history[this.history.length - 1].params };
  }
  
  // 回滚到特定版本
  rollbackTo(hash: string): Record<string, any> | null {
    const version = this.getVersion(hash);
    if (!version) return null;
    
    // 添加回滚记录
    this.commitChange(version.params, `Rollback to version: ${hash.substring(0, 8)}`);
    
    return { ...version.params };
  }
  
  // 对比两个版本的差异
  compareVersions(hash1: string, hash2: string): Record<string, { old: any, new: any }> | null {
    const version1 = this.getVersion(hash1);
    const version2 = this.getVersion(hash2);
    
    if (!version1 || !version2) return null;
    
    const diffs: Record<string, { old: any, new: any }> = {};
    
    // 找出所有参数的差异
    const allKeys = new Set([
      ...Object.keys(version1.params),
      ...Object.keys(version2.params)
    ]);
    
    allKeys.forEach(key => {
      const value1 = version1.params[key];
      const value2 = version2.params[key];
      
      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        diffs[key] = { old: value1, new: value2 };
      }
    });
    
    return diffs;
  }
  
  // 生成配置的哈希值 - 不使用Buffer，改用简单字符串哈希
  private generateHash(params: Record<string, any>): string {
    const jsonStr = JSON.stringify(params);
    
    // 简单哈希算法
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // 转换为32位整数
    }
    
    // 转换为十六进制字符串
    const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
    
    // 添加时间戳以确保唯一性
    return hashHex + Date.now().toString(36);
  }
  
  // 保存历史到本地存储
  private saveHistory(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    }
  }
  
  // 从本地存储加载历史
  private loadHistory(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          this.history = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved config history', e);
          this.history = [];
        }
      }
    }
  }
}
