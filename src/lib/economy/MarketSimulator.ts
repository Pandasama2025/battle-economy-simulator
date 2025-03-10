
// 动态市场模拟器

export interface Item {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  supply: number;
  demand: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface Transaction {
  itemId: string;
  quantity: number;
  type: "buy" | "sell";
  price: number;
  timestamp: number;
  playerId: string;
}

export class MarketSimulator {
  private items: Record<string, Item> = {};
  private transactionLog: Transaction[] = [];
  private volatility = 0.05; // 价格波动系数

  constructor(initialItems?: Item[]) {
    if (initialItems) {
      initialItems.forEach(item => {
        this.items[item.id] = { ...item };
      });
    }
  }

  // 更新所有物品价格
  updatePrices(): void {
    Object.values(this.items).forEach(item => {
      // 计算最近交易的供需
      const recentTransactions = this.getRecentTransactions(item.id, 10);
      
      let buyCount = 0;
      let sellCount = 0;
      
      recentTransactions.forEach(t => {
        if (t.type === "buy") {
          buyCount += t.quantity;
        } else {
          sellCount += t.quantity;
        }
      });
      
      // 更新供需数据
      item.demand = buyCount;
      item.supply = sellCount;
      
      // 计算需求差
      const demandDiff = buyCount - sellCount;
      
      // 根据需求差调整价格
      item.currentPrice *= (1 + this.volatility * demandDiff / Math.max(1, buyCount + sellCount));
      
      // 添加一些随机波动
      item.currentPrice *= (1 + (Math.random() * 0.02 - 0.01));
      
      // 确保价格不低于基础价格的50%且不高于基础价格的200%
      const minPrice = item.basePrice * 0.5;
      const maxPrice = item.basePrice * 2.0;
      item.currentPrice = Math.max(minPrice, Math.min(maxPrice, item.currentPrice));
    });
  }

  // 记录交易
  recordTransaction(transaction: Transaction): void {
    this.transactionLog.push({
      ...transaction,
      timestamp: Date.now()
    });
    
    // 更新供需并可能触发价格更新
    if (this.transactionLog.length % 5 === 0) {
      this.updatePrices();
    }
  }

  // 获取特定物品的最近交易
  private getRecentTransactions(itemId: string, count: number): Transaction[] {
    return this.transactionLog
      .filter(t => t.itemId === itemId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  // 获取所有物品当前状态
  getMarketSnapshot(): Item[] {
    return Object.values(this.items);
  }

  // 根据玩家类型模拟购买行为
  simulatePlayerActivity(playerType: string, playerId: string): void {
    const playerBehaviors: Record<string, { buyProbability: number, sellProbability: number, quantityRange: [number, number] }> = {
      "aggressive": { buyProbability: 0.7, sellProbability: 0.3, quantityRange: [2, 5] },
      "economy": { buyProbability: 0.4, sellProbability: 0.6, quantityRange: [1, 3] },
      "hoarder": { buyProbability: 0.8, sellProbability: 0.1, quantityRange: [3, 7] },
      "flipper": { buyProbability: 0.5, sellProbability: 0.5, quantityRange: [4, 10] },
    };
    
    const behavior = playerBehaviors[playerType] || playerBehaviors["economy"];
    const itemIds = Object.keys(this.items);
    
    // 随机选择一个物品
    const randomItemId = itemIds[Math.floor(Math.random() * itemIds.length)];
    const item = this.items[randomItemId];
    
    // 决定买还是卖
    const action = Math.random() < behavior.buyProbability / (behavior.buyProbability + behavior.sellProbability) ? "buy" : "sell";
    
    // 决定数量
    const [min, max] = behavior.quantityRange;
    const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // 记录交易
    this.recordTransaction({
      itemId: randomItemId,
      quantity,
      type: action,
      price: item.currentPrice,
      timestamp: Date.now(),
      playerId
    });
  }
}
