
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const UpdateManager = () => {
  // 更新日志数据
  const updates = [
    {
      version: "1.0.0",
      date: "2023-10-15",
      title: "初始版本发布",
      changes: [
        "自走棋战斗系统的基础功能",
        "单位创建与编辑",
        "战斗模拟与可视化"
      ]
    },
    {
      version: "1.1.0",
      date: "2023-11-20",
      title: "羁绊系统更新",
      changes: [
        "添加种族和职业羁绊系统",
        "优化战斗算法",
        "改进用户界面"
      ]
    },
    {
      version: "1.2.0",
      date: "2024-01-10",
      title: "派系与经济系统",
      changes: [
        "新增派系系统",
        "添加经济模拟功能",
        "改进战斗平衡性",
        "新增数据分析工具"
      ]
    },
    {
      version: "1.3.0",
      date: "2024-03-15",
      title: "UI优化与平衡调整",
      changes: [
        "全面优化用户界面",
        "改进战斗日志显示",
        "调整单位属性平衡",
        "修复已知错误",
        "支持本地数据保存"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">更新日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {updates.map((update, index) => (
              <div key={index} className={index !== 0 ? "pt-6" : ""}>
                {index !== 0 && <Separator className="mb-6" />}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      {update.title}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">版本 {update.version}</Badge>
                      <Badge variant="secondary">{update.date}</Badge>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 list-disc pl-5">
                  {update.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="text-muted-foreground">
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateManager;
