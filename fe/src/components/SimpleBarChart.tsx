import React from 'react';
import './SimpleBarChart.css';

interface SimpleBarChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  labels,
  color = 'var(--accent-purple)',
  height = 120
}) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="simple-bar-chart" style={{ height: `${height}px` }}>
      <div className="chart-bars">
        {data.map((value, index) => {
          const percentage = (value / maxValue) * 100;
          return (
            <div key={index} className="bar-container">
              <div
                className="bar"
                style={{
                  height: `${percentage}%`,
                  background: color,
                }}
              />
              {labels && labels[index] && (
                <span className="bar-label">{labels[index]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleBarChart;
