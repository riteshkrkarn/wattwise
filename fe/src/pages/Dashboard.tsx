import React, { useState } from 'react';
import { AnimatedNavBar } from '../components/AnimatedNavBar';
import SmartRecommendation from '../components/SmartRecommendation';
import EnergyBarChart from '../components/EnergyBarChart';
import { RelativeTimeCard } from '../components/ui/relative-time-card';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  // Use a fixed timestamp for demo (current time when component mounts)
  const [pageLoadTime] = useState(Date.now());

  // Chart data
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const lightingData = [45, 52, 48, 55, 50, 53, 47, 51, 49, 54, 52, 48];
  const refrigeratorData = [28, 30, 29, 32, 31, 28, 30, 29, 31, 30, 29, 32];
  const acData = [35, 38, 42, 40, 39, 41, 37, 40, 38, 42, 41, 39];

  // Calculate total monthly consumption and bill
  const avgLighting = lightingData.reduce((a, b) => a + b, 0) / lightingData.length;
  const avgRefrigerator = refrigeratorData.reduce((a, b) => a + b, 0) / refrigeratorData.length;
  const avgAC = acData.reduce((a, b) => a + b, 0) / acData.length;
  
  const dailyConsumption = avgLighting + avgRefrigerator + avgAC; // kWh per day
  const monthlyConsumption = dailyConsumption * 30; // kWh per month
  const ratePerUnit = 7; // ₹7 per kWh (average rate)
  const totalMonthlyBill = Math.round(monthlyConsumption * ratePerUnit);

  // Last month data (8% higher consumption)
  const lastMonthConsumption = Math.round(monthlyConsumption * 1.08);
  const lastMonthBill = Math.round(lastMonthConsumption * ratePerUnit);
  const billDifference = lastMonthBill - totalMonthlyBill;
  const percentageChange = Math.round((billDifference / lastMonthBill) * 100);

  // Calculate savings based on percentages
  const peakHourSavings = {
    percentage: 15, // 15% savings
    energy: Math.round(monthlyConsumption * 0.15),
    amount: Math.round(totalMonthlyBill * 0.15)
  };

  const acOptimizationSavings = {
    percentage: 12, // 12% savings
    energy: Math.round(monthlyConsumption * 0.12),
    amount: Math.round(totalMonthlyBill * 0.12)
  };

  const maintenanceSavings = {
    percentage: 8, // 8% savings
    energy: Math.round(monthlyConsumption * 0.08),
    amount: Math.round(totalMonthlyBill * 0.08)
  };

  return (
    <div className="dashboard-new">
      <AnimatedNavBar />
      
      <div className="dashboard-container">
        {/* Header with RelativeTimeCard */}
        <div className="dashboard-header-new">
          <h1>Overview</h1>
          <div className="time-date-container">
            <RelativeTimeCard date={pageLoadTime} side="bottom">
              <div className="time-display" style={{ cursor: 'pointer' }}>
                Date & Time
              </div>
            </RelativeTimeCard>
          </div>
        </div>

        {/* Last Month Bill Section */}
        <div className="last-month-bill-section">
          <div className="bill-card-minimal">
            <div className="bill-row">
              <div className="bill-main">
                <span className="bill-label">Last Month Bill</span>
                <div className="bill-amount-minimal">
                  ₹{lastMonthBill.toLocaleString()}
                </div>
                <span className="bill-subtitle">November 2025 • {lastMonthConsumption} kWh</span>
              </div>
              <div className="bill-comparison">
                <div className={`comparison-badge ${billDifference > 0 ? 'badge-increase' : 'badge-decrease'}`}>
                  <span className="badge-icon">{billDifference > 0 ? '↑' : '↓'}</span>
                  <span className="badge-text">
                    {Math.abs(percentageChange)}% vs this month
                  </span>
                </div>
                <div className="comparison-details">
                  <span className={billDifference > 0 ? 'text-warning' : 'text-success'}>
                    {billDifference > 0 ? '+' : '-'}₹{Math.abs(billDifference)}
                  </span>
                  <span className="comparison-label">difference</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Consumption Section - Using new charts */}
        <div className="energy-consumption-section">
          <div className="section-header-row">
            <h2>Total Energy Consumption</h2>
          </div>

          <div className="appliance-grid-clean">
            {/* Lighting */}
            <div className="appliance-item">
              <div className="appliance-header-clean">
                <span>Lighting ↑</span>
                <button className="menu-btn">•••</button>
              </div>
              <div style={{ height: '140px', width: '100%' }}>
                <EnergyBarChart 
                  data={lightingData}
                  labels={dayLabels}
                  color="var(--accent-purple)"
                  height={140}
                />
              </div>
              <div className="appliance-metric-clean">
                <div className="metric-value">52-48</div>
                <div className="metric-label-clean">kWh per month</div>
              </div>
            </div>

            {/* Refrigerator */}
            <div className="appliance-item">
              <div className="appliance-header-clean">
                <span>Refrigerator ↓</span>
                <button className="menu-btn">•••</button>
              </div>
              <div style={{ height: '140px', width: '100%' }}>
                <EnergyBarChart 
                  data={refrigeratorData}
                  labels={dayLabels}
                  color="var(--accent-purple)"
                  height={140}
                />
              </div>
              <div className="appliance-metric-clean">
                <div className="metric-value">29-71</div>
                <div className="metric-label-clean">kWh per month</div>
              </div>
            </div>

            {/* Air Conditioner */}
            <div className="appliance-item">
              <div className="appliance-header-clean">
                <span>Air Conditioner ↓</span>
                <button className="menu-btn">•••</button>
              </div>
              <div style={{ height: '140px', width: '100%' }}>
                <EnergyBarChart 
                  data={acData}
                  labels={dayLabels}
                  color="var(--accent-purple)"
                  height={140}
                />
              </div>
              <div className="appliance-metric-clean">
                <div className="metric-value">37-63</div>
                <div className="metric-label-clean">kWh per month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations Section */}
        <div className="recommendations-section">
          <h2 style={{ marginBottom: 'var(--spacing-xl)', fontSize: '1.5rem', fontWeight: 600 }}>
            Smart Recommendations
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 'var(--spacing-md)' }}>
              Based on your monthly bill of ₹{totalMonthlyBill}
            </span>
          </h2>
          <div className="recommendations-grid">
            <SmartRecommendation
              priority="high"
              category="energy"
              title="Reduce Peak Hour Consumption"
              description={`Your energy usage spikes between 6-9 PM daily. Shifting heavy appliances (washing machine, iron) to off-peak hours can reduce your bill by ${peakHourSavings.percentage}%.`}
              savings={{ amount: `₹${peakHourSavings.amount}/month (${peakHourSavings.percentage}%)`, energy: `${peakHourSavings.energy} kWh` }}
              onAction={() => console.log('Schedule appliances')}
              onDismiss={() => console.log('Dismissed')}
            />
            
            <SmartRecommendation
              priority="medium"
              category="cost"
              title="Optimize Air Conditioner Usage"
              description={`Set AC to 24°C instead of 18°C and use timer mode. This can reduce your electricity bill by ${acOptimizationSavings.percentage}%.`}
              savings={{ amount: `₹${acOptimizationSavings.amount}/month (${acOptimizationSavings.percentage}%)`, energy: `${acOptimizationSavings.energy} kWh` }}
              onAction={() => console.log('Set AC timer')}
              onDismiss={() => console.log('Dismissed')}
            />
            
            <SmartRecommendation
              priority="low"
              category="maintenance"
              title="Refrigerator Efficiency Check"
              description={`Your refrigerator is consuming 15% more than normal. Clean the coils and check door seals to save ${maintenanceSavings.percentage}% on your bill.`}
              savings={{ amount: `₹${maintenanceSavings.amount}/month (${maintenanceSavings.percentage}%)`, energy: `${maintenanceSavings.energy} kWh` }}
              onAction={() => console.log('Schedule maintenance')}
              onDismiss={() => console.log('Dismissed')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
