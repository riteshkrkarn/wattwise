import React, { useState, useEffect } from "react";
import axios from "axios";
import { AnimatedNavBar } from "../components/AnimatedNavBar";

import EnergyBarChart from "../components/EnergyBarChart";
import { RelativeTimeCard } from "../components/ui/relative-time-card";
import { AnimatedBackground } from "../components/AnimatedBackground";
import type { BillRecord, AIResult, ApiResponse } from "../types";
import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [billHistory, setBillHistory] = useState<BillRecord[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIResult | null>(
    null
  );
  const [loadingBills, setLoadingBills] = useState(true);

  // New state for enhanced view
  const [daysView, setDaysView] = useState<14 | 30>(14);
  const [showAllAppliances, setShowAllAppliances] = useState(false);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch bill history on mount
  useEffect(() => {
    const fetchBillHistory = async () => {
      try {
        setLoadingBills(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get<ApiResponse<BillRecord[]>>(
          `${API_BASE_URL}/api/v1/bills/history`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (response.data.success && response.data.data) {
          setBillHistory(response.data.data);

          // Load AI recommendations from the latest bill if available
          if (response.data.data.length > 0) {
            const latestBill = response.data.data[0];
            if (latestBill.aiRecommendations) {
              setAiRecommendations(latestBill.aiRecommendations);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch bill history:", error);
      } finally {
        setLoadingBills(false);
      }
    };

    fetchBillHistory();
  }, []);

  // Get latest bill for display
  const latestBill = billHistory[0];
  const hasBillData = billHistory.length > 0;

  // Process breakdown data for charts with day view support
  const getChartDataForAppliance = (applianceName: string, days: number) => {
    if (!latestBill?.breakdown) return [];

    // Improved matching logic for lighting and others
    const normalize = (s: string) => s.toLowerCase().trim();
    const target = normalize(applianceName);

    const appliance = latestBill.breakdown.find((item) => {
      const name = normalize(item.name);
      if (target === "light" || target === "lighting") {
        return (
          name.includes("light") ||
          name.includes("bulb") ||
          name.includes("lamp") ||
          name.includes("led") ||
          name.includes("tube")
        );
      }
      return name.includes(target);
    });

    if (!appliance) return [];

    // Use monthlyUnits if available, otherwise calculate from cost
    const monthlyUnits = appliance.monthlyUnits || appliance.estimatedCost / 8;

    if (!monthlyUnits || monthlyUnits === 0) return [];

    // Generate daily data points
    const baseValue = monthlyUnits / 30; // Daily average
    return Array.from({ length: days }, () => {
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation for more realism
      return Math.max(0, baseValue * (1 + variation));
    });
  };

  const getApplianceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("fridge") || n.includes("refrigerator"))
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      );
    if (n.includes("ac") || n.includes("conditioner"))
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2v20M5 12h14M8 5l4 4-4 4M16 5l-4 4 4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    if (n.includes("light") || n.includes("lamp"))
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />
        </svg>
      );
    if (n.includes("fan"))
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 12l4.5-4.5M12 12l-4.5-4.5M12 12l0 6" />
        </svg>
      );
    if (n.includes("tv") || n.includes("television"))
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      );
    // Default
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    );
  };

  // Generate labels based on day view
  const getDayLabels = (days: number) => {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    }
    return labels;
  };

  const chartLabels = getDayLabels(daysView);

  // Prepare appliances to display
  const appliancesToDisplay =
    hasBillData && latestBill?.breakdown
      ? showAllAppliances
        ? latestBill.breakdown
        : latestBill.breakdown.slice(0, 3)
      : [];

  // Demo data fallback if needed (though we prefer empty or loading state)

  return (
    <div className="dashboard-new">
      <AnimatedBackground />
      <AnimatedNavBar />

      <div className="dashboard-container">
        {/* Header - Always visible */}
        <div className="dashboard-header-new">
          <div className="header-left">
            <h1>Dashboard</h1>
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span className="status-text">Live</span>
            </div>
          </div>
          <div className="time-date-container">
            <RelativeTimeCard date={currentTime} side="bottom">
              <div className="time-display" style={{ cursor: "pointer" }}>
                {new Date(currentTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                •{" "}
                {new Date(currentTime).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </RelativeTimeCard>
          </div>
        </div>

        {/* Last Month Bill Section - Progressive Loading */}
        <div className="last-month-bill-section">
          {loadingBills ? (
            <div className="bill-card-minimal skeleton-card">
              <div
                className="skeleton-text"
                style={{ width: "60%", height: "24px" }}
              ></div>
              <div
                className="skeleton-text"
                style={{ width: "40%", height: "40px", marginTop: "12px" }}
              ></div>
              <div
                className="skeleton-text"
                style={{ width: "50%", height: "16px", marginTop: "8px" }}
              ></div>
            </div>
          ) : hasBillData && latestBill ? (
            <div className="bill-card-minimal fade-in">
              <div className="bill-row">
                <div className="bill-main">
                  <span className="bill-label">Last Bill</span>
                  <div className="bill-amount-minimal">
                    ₹
                    {latestBill.actualBillAmount?.toLocaleString() ||
                      latestBill.totalEstimatedCost?.toLocaleString()}
                  </div>
                  <span className="bill-subtitle">
                    {new Date(latestBill.date || Date.now()).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}{" "}
                    • {latestBill.totalEstimatedUnits} kWh
                  </span>
                </div>
                {latestBill.discrepancyRatio && (
                  <div className="bill-comparison">
                    <div
                      className={`comparison-badge ${
                        latestBill.discrepancyRatio > 1
                          ? "badge-increase"
                          : "badge-decrease"
                      }`}
                    >
                      <span className="badge-icon">
                        {latestBill.discrepancyRatio > 1 ? "↑" : "↓"}
                      </span>
                      <span className="badge-text">
                        {Math.abs(
                          Math.round((latestBill.discrepancyRatio - 1) * 100)
                        )}
                        % vs estimate
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bill-card-minimal empty-state-card fade-in">
              {/* ... Empty state content same as before ... */}
              <div className="empty-state-content-enhanced">
                <div className="empty-state-text">
                  <h3 className="empty-state-title">No Bills Yet</h3>
                  <p>Add a bill to see your history.</p>
                  <button
                    className="cta-button"
                    onClick={() => (window.location.href = "/bills")}
                  >
                    Add Bill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Energy Consumption Section */}
        <div
          className="energy-consumption-section fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="section-header-row">
            <h2>Energy Consumption</h2>
            <div className="header-controls">
              <div className="view-controls">
                <button
                  className={`view-btn ${daysView === 14 ? "active" : ""}`}
                  onClick={() => setDaysView(14)}
                >
                  14 Days
                </button>
                <button
                  className={`view-btn ${daysView === 30 ? "active" : ""}`}
                  onClick={() => setDaysView(30)}
                >
                  30 Days
                </button>
              </div>
              {hasBillData && (
                <button
                  className="view-all-btn"
                  onClick={() => setShowAllAppliances(!showAllAppliances)}
                >
                  {showAllAppliances ? "Show Less" : "View All"}
                </button>
              )}
            </div>
          </div>

          <div className="appliance-grid-clean">
            {hasBillData &&
              appliancesToDisplay.map((appliance, idx) => {
                const chartData = getChartDataForAppliance(
                  appliance.name,
                  daysView
                );
                const isExpanded = expandedCard === appliance.name;
                const dailyAvg = Math.round(
                  (appliance.monthlyUnits || appliance.estimatedCost / 8) / 30
                );

                return (
                  <div
                    key={idx}
                    className={`appliance-item interactive-card ${
                      isExpanded ? "expanded" : ""
                    }`}
                    onClick={() =>
                      setExpandedCard(isExpanded ? null : appliance.name)
                    }
                  >
                    <div className="appliance-header-clean">
                      <div className="header-left-section">
                        <div
                          className={`appliance-icon ${appliance.name
                            .toLowerCase()
                            .replace(/\s/g, "-")}-icon`}
                        >
                          {getApplianceIcon(appliance.name)}
                        </div>
                        <div>
                          <span className="appliance-name">
                            {appliance.name}
                          </span>
                          {/* Placeholder trend for MVP */}
                          <span className="trend-badge increase">
                            {Math.round(Math.random() * 5 + 1)}%
                          </span>
                        </div>
                      </div>
                      {/* <button
                        className="expand-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCard(isExpanded ? null : appliance.name);
                        }}
                      >
                        {isExpanded ? "−" : "+"}
                      </button> */}
                    </div>

                    <div
                      className="chart-container"
                      style={{ height: isExpanded ? "180px" : "140px" }}
                    >
                      {chartData.length > 0 ? (
                        <EnergyBarChart
                          data={chartData}
                          labels={chartLabels}
                          color={idx % 2 === 0 ? "#00d9ff" : "#a78bfa"}
                          height={isExpanded ? 180 : 140}
                        />
                      ) : (
                        <div className="no-data-chart">
                          No daily data available
                        </div>
                      )}
                    </div>

                    <div className="appliance-metric-clean">
                      <div className="metric-row">
                        <div className="metric-value">{dailyAvg}</div>
                        <div className="metric-change positive">kWh</div>
                      </div>
                      <div className="metric-label-clean">
                        Avg. daily consumption
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="expanded-details">
                        <div className="detail-row">
                          <span className="detail-label">Count:</span>
                          <span className="detail-value">
                            {appliance.count}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Monthly Total:</span>
                          <span className="detail-value">
                            {Math.round(appliance.monthlyUnits || 0)} kWh
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {!hasBillData && !loadingBills && (
              <div className="no-data-placeholder">
                <p>Estimate a bill to see breakdown.</p>
              </div>
            )}
          </div>
        </div>

        {
          /* Smart Recommendations Section */
          // ... (keep existing recommendations section)
        }

        {aiRecommendations ? (
          <div
            className="recommendations-section fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="section-header-row">
              <h2>Smart Recommendations</h2>
              <span className="recommendations-badge">AI-Powered</span>
            </div>

            <div className="recommendations-grid">
              {/* Carbon Footprint Card */}
              <div className="recommendation-card high-priority">
                <div className="recommendation-header">
                  <div className="priority-badge high">Impact</div>
                  <div className="category-icon energy">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="recommendation-title">Carbon Footprint</h3>
                <p className="recommendation-description">
                  Your monthly usage generates{" "}
                  <strong>{aiRecommendations.carbonFootprint} kg</strong> of
                  CO2.
                  {aiRecommendations.impact && (
                    <span className="impact-text">
                      {" "}
                      That's like driving {aiRecommendations.impact.carKm} km!
                    </span>
                  )}
                </p>
                <div className="savings-info">
                  <div className="savings-item">
                    <span className="savings-label">Trees to Offset</span>
                    <span className="savings-value">
                      {aiRecommendations.impact?.trees || 0} Trees
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Suggestions */}
              {aiRecommendations.suggestions &&
                aiRecommendations.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={`recommendation-card ${
                      idx % 2 === 0 ? "medium-priority" : "low-priority"
                    }`}
                  >
                    <div className="recommendation-header">
                      <div
                        className={`priority-badge ${
                          idx % 2 === 0 ? "medium" : "low"
                        }`}
                      >
                        Suggestion
                      </div>
                      <div className="category-icon appliance">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 11h6m-6 4h6m-6-8h6" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="recommendation-title">{suggestion.name}</h3>
                    <p className="recommendation-description">
                      {suggestion.strategy}
                    </p>
                    <div className="savings-info">
                      <div className="savings-item">
                        <span className="savings-label">Potential Savings</span>
                        <span className="savings-value">
                          ₹{suggestion.savedAmount}
                        </span>
                      </div>
                      <div className="savings-item">
                        <span className="savings-label">Reduction</span>
                        <span className="savings-value">
                          {Math.round(suggestion.reductionPercentage * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div
            className="recommendations-section fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="section-header-row">
              <h2>Smart Recommendations</h2>
            </div>
            <div className="bill-card-minimal empty-state-card">
              <div className="empty-state-content-enhanced">
                <p>
                  Upload a bill and run estimation to see AI-powered
                  recommendations!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
