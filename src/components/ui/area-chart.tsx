
import React from 'react';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export interface AreaChartProps {
  data: Array<Record<string, any>>;
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGridLines?: boolean;
  height?: number;
  className?: string;
}

export const AreaChart = ({
  data,
  categories,
  index,
  colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  height = 300,
  className,
}: AreaChartProps) => {
  const chartConfig = categories.reduce((acc, category, idx) => {
    acc[category] = {
      color: colors[idx % colors.length],
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <ChartContainer 
      config={chartConfig} 
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
          {showXAxis && <XAxis dataKey={index} tick={{ fontSize: 12 }} />}
          {showYAxis && <YAxis width={yAxisWidth} tick={{ fontSize: 12 }} />}
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload) return null;
            return (
              <ChartTooltipContent
                active={active}
                payload={payload}
                formatter={(value) => valueFormatter(Number(value))}
              />
            );
          }} />
          {categories.map((category, idx) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
              fillOpacity={0.2}
              stackId="1"
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
