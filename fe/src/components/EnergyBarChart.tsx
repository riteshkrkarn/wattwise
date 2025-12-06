import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import './EnergyBarChart.css';

interface EnergyBarChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
}

const EnergyBarChart: React.FC<EnergyBarChartProps> = ({ 
  data, 
  labels,
  color = '#a78bfa',
  height = 140
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Transform data for recharts
  const chartData = data.map((value, index) => ({
    name: labels?.[index] || `${index + 1}`,
    value: value,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-label">{payload[0].payload.name}</div>
          <div className="tooltip-value">
            <span className="tooltip-number">{payload[0].value}</span>
            <span className="tooltip-unit">kWh</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="energy-bar-chart" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              setActiveIndex(state.activeTooltipIndex ?? null);
            } else {
              setActiveIndex(null);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {/* Add gradient definitions */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.6} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="0" 
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
          />
          
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7a8ca0', fontSize: 11, fontWeight: 500 }}
            hide={!labels}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7a8ca0', fontSize: 11, fontWeight: 500 }}
            tickCount={5}
            domain={[0, 'auto']}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={false} />
          
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
            maxBarSize={40}
          >
            {chartData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={activeIndex === index ? "url(#barGradientActive)" : "url(#barGradient)"}
                filter={activeIndex === index ? "url(#glow)" : ""}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyBarChart;
