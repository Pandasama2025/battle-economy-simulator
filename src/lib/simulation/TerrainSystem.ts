
// 战场环境系统
export type TerrainType = "plain" | "forest" | "desert" | "mountain" | "water";

interface TerrainEffect {
  speed?: number;       // 移动速度修正
  healing?: number;     // 治疗效果修正
  manaRegen?: number;   // 魔法恢复修正
  damageModifier?: number; // 伤害修正
  specialEffect?: string;  // 特殊效果名称
  burnDamage?: number;     // 灼烧伤害
}

// 地形效果计算
export function calculateTerrainImpact(terrainType: TerrainType): TerrainEffect {
  const terrainEffects: Record<TerrainType, TerrainEffect> = {
    plain: { speed: 1.0 },
    forest: { speed: 0.8, healing: 1.2 },
    desert: { manaRegen: 0.5, burnDamage: 5 },
    mountain: { speed: 0.6, damageModifier: 1.1 },
    water: { speed: 0.7, manaRegen: 1.3 }
  };

  return terrainEffects[terrainType] || {};
}

// 地形管理器
export class TerrainManager {
  private terrainMap: Record<string, TerrainType> = {};

  constructor(mapSize: { width: number; height: number }) {
    this.generateTerrain(mapSize);
  }

  // 生成地形
  private generateTerrain(mapSize: { width: number; height: number }): void {
    const terrainTypes: TerrainType[] = ["plain", "forest", "desert", "mountain", "water"];
    
    // 简单随机生成地形
    for (let x = 0; x < mapSize.width; x++) {
      for (let y = 0; y < mapSize.height; y++) {
        const position = `${x},${y}`;
        const randomIndex = Math.floor(Math.random() * terrainTypes.length);
        this.terrainMap[position] = terrainTypes[randomIndex];
      }
    }
  }

  // 获取指定位置的地形
  getTerrainAt(x: number, y: number): TerrainType {
    const position = `${x},${y}`;
    return this.terrainMap[position] || "plain";
  }

  // 获取地形效果
  getTerrainEffect(x: number, y: number): TerrainEffect {
    const terrainType = this.getTerrainAt(x, y);
    return calculateTerrainImpact(terrainType);
  }
}
