import React, { useState } from "react";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Analytics.css";

interface CostBreakdownItem {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("month");

  // Sample data - replace with actual data from backend
  const consumptionData = [
    { month: "Jun", consumption: 420 },
    { month: "Jul", consumption: 480 },
    { month: "Aug", consumption: 510 },
    { month: "Sep", consumption: 450 },
    { month: "Oct", consumption: 430 },
    { month: "Nov", consumption: 462 },
  ];

  const costBreakdown: CostBreakdownItem[] = [
    { name: "Air Conditioner", value: 1200, percentage: 37 },
    { name: "Lighting", value: 840, percentage: 26 },
    { name: "Refrigerator", value: 720, percentage: 22 },
    { name: "Others", value: 480, percentage: 15 },
  ];

  const COLORS = ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9"];

  const totalConsumption = 462; // kWh
  const totalCost = 3240; // ₹
  const avgDaily = 15.4; // kWh

  return (
    <div className="analytics-page">
      <AnimatedNavBar />

      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Analytics</h1>
          <div className="time-range-selector">
            <button
              className={`range-btn ${timeRange === "week" ? "active" : ""}`}
              onClick={() => setTimeRange("week")}
            >
              Week
            </button>
            <button
              className={`range-btn ${timeRange === "month" ? "active" : ""}`}
              onClick={() => setTimeRange("month")}
            >
              Month
            </button>
            <button
              className={`range-btn ${timeRange === "year" ? "active" : ""}`}
              onClick={() => setTimeRange("year")}
            >
              Year
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="analytics-summary">
          <div className="summary-card">
            <span className="summary-label">Total Consumption</span>
            <span className="summary-value">{totalConsumption} kWh</span>
            <span className="summary-subtext">This month</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total Cost</span>
            <span className="summary-value">₹{totalCost}</span>
            <span className="summary-subtext">This month</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Daily Average</span>
            <span className="summary-value">{avgDaily} kWh</span>
            <span className="summary-subtext">Per day</span>
          </div>
        </div>

        {/* Main Chart: Consumption Trend */}
        <div className="chart-section">
          <h2 className="chart-title">Consumption Trend</h2>
          <p className="chart-subtitle">Last 6 months energy usage</p>
          <div className="chart-container" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(122, 140, 160, 0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#7a8ca0", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#7a8ca0", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "kWh",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#7a8ca0",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(26, 31, 58, 0.95)",
                    border: "1px solid rgba(167, 139, 250, 0.3)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#b8c5d6" }}
                  itemStyle={{ color: "#a78bfa" }}
                  formatter={(value: number) => [`${value} kWh`, "Consumption"]}
                />
                <Bar
                  dataKey="consumption"
                  fill="var(--accent-purple)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="chart-section">
          <h2 className="chart-title">Cost Breakdown</h2>
          <p className="chart-subtitle">Where your money goes</p>
          <div className="breakdown-content">
            <div className="pie-chart-container" style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdown.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(26, 31, 58, 0.95)",
                      border: "1px solid rgba(167, 139, 250, 0.3)",
                      borderRadius: "8px",
                      color: "#e0e0e0",
                    }}
                    itemStyle={{ color: "#e0e0e0" }}
                    labelStyle={{ color: "#b8c5d6" }}
                    formatter={(value: number) => [`₹${value}`, "Cost"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="breakdown-list">
              {costBreakdown.map((item, index) => (
                <div key={item.name} className="breakdown-item">
                  <div className="breakdown-label">
                    <div
                      className="breakdown-color"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <div className="breakdown-value">
                    <span className="breakdown-amount">₹{item.value}</span>
                    <span className="breakdown-percent">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
