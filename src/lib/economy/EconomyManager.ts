
import { Player, MarketItem, EconomyState, EconomyConfiguration } from '@/types/economy';

export class EconomyManager {
  private state: EconomyState;
  private config: EconomyConfiguration;

  constructor(config: EconomyConfiguration) {
    this.config = config;
    this.state = {
      roundNumber: 0,
      phase: 'preparation',
      players: [],
      market: [],
      interestRate: 0.1,
      incomeBase: config.roundIncome.base,
      streakBonus: {
        win: [1, 2, 3, 4],
        lose: [1, 2, 2, 3]
      },
      globalEvents: []
    };
  }

  // 开始新回合
  startNewRound(): void {
    this.state.roundNumber++;
    this.state.phase = 'preparation';
    this.updateMarket();
    this.distributeIncome();
  }

  // 更新市场
  private updateMarket(): void {
    // 更新物品价格和库存
    this.state.market = this.state.market.map(item => ({
      ...item,
      currentPrice: this.calculateNewPrice(item),
      quantity: this.restockItem(item)
    }));
  }

  // 计算新价格
  private calculateNewPrice(item: MarketItem): number {
    const demandFactor = Math.random() * 0.4 + 0.8; // 0.8-1.2的随机需求系数
    return Math.round(item.basePrice * demandFactor);
  }

  // 补充库存
  private restockItem(item: MarketItem): number {
    const baseStock = this.config.itemPoolSize[item.type] || 5;
    return Math.max(item.quantity, Math.floor(baseStock * Math.random()));
  }

  // 分发收入
  private distributeIncome(): void {
    this.state.players.forEach(player => {
      const baseIncome = this.config.roundIncome.base;
      const interestIncome = Math.floor(player.gold * this.state.interestRate);
      const streakBonus = this.calculateStreakBonus(player);
      
      player.gold += baseIncome + interestIncome + streakBonus;
    });
  }

  // 计算连胜/连败奖励
  private calculateStreakBonus(player: Player): number {
    if (player.winStreak > 0) {
      const bonusIndex = Math.min(player.winStreak - 1, this.state.streakBonus.win.length - 1);
      return this.state.streakBonus.win[bonusIndex];
    } else if (player.loseStreak > 0) {
      const bonusIndex = Math.min(player.loseStreak - 1, this.state.streakBonus.lose.length - 1);
      return this.state.streakBonus.lose[bonusIndex];
    }
    return 0;
  }

  // 购买物品
  purchaseItem(playerId: string, itemId: string): boolean {
    const player = this.state.players.find(p => p.id === playerId);
    const item = this.state.market.find(i => i.id === itemId);

    if (!player || !item || item.quantity <= 0 || player.gold < item.currentPrice) {
      return false;
    }

    // 执行购买
    player.gold -= item.currentPrice;
    item.quantity--;
    
    // 添加到玩家物品栏
    const playerItem = player.items.find(i => i.itemId === itemId);
    if (playerItem) {
      playerItem.count++;
    } else {
      player.items.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        count: 1,
        equipped: false
      });
    }

    return true;
  }

  // 出售物品
  sellItem(playerId: string, playerItemId: string): boolean {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return false;

    const itemIndex = player.items.findIndex(i => i.id === playerItemId);
    if (itemIndex === -1) return false;

    const item = player.items[itemIndex];
    const marketItem = this.state.market.find(i => i.id === item.itemId);
    if (!marketItem) return false;

    // 计算出售价格
    const sellPrice = Math.floor(marketItem.currentPrice * this.config.sellingReturn);
    
    // 执行出售
    player.gold += sellPrice;
    if (item.count > 1) {
      item.count--;
    } else {
      player.items.splice(itemIndex, 1);
    }

    return true;
  }

  // 获取当前经济状态
  getState(): EconomyState {
    return { ...this.state };
  }

  // 添加玩家
  addPlayer(player: Player): void {
    this.state.players.push(player);
  }

  // 更新玩家状态
  updatePlayerStatus(playerId: string, won: boolean): void {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return;

    if (won) {
      player.winStreak++;
      player.loseStreak = 0;
    } else {
      player.loseStreak++;
      player.winStreak = 0;
    }
  }
}
