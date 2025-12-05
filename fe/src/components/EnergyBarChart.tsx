import React from 'react';
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
  // Transform data for recharts
  const chartData = data.map((value, index) => ({
    name: labels?.[index] || `${index + 1}`,
    value: value,
  }));

  return (
    <div className="energy-bar-chart" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(122, 140, 160, 0.1)"
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7a8ca0', fontSize: 11 }}
            hide={!labels}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7a8ca0', fontSize: 11 }}
            tickCount={5}
            domain={[0, 'auto']}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(167, 139, 250, 0.1)' }}
            contentStyle={{
              backgroundColor: 'rgba(26, 31, 58, 0.95)',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            labelStyle={{ 
              color: '#b8c5d6',
              fontWeight: 600,
              marginBottom: '4px'
            }}
            itemStyle={{ 
              color: '#a78bfa',
              fontWeight: 600
            }}
            formatter={(value: number) => [`${value} kWh`, 'Energy']}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={color} opacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyBarChart;
