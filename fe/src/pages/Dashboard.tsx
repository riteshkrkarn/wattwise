import React, { useState, useEffect } from "react";
import axios from "axios";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import SmartRecommendation from "../components/SmartRecommendation";
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
  const [loadingAI, setLoadingAI] = useState(false);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every 60 seconds (1 minute)

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

          // If we have bill data, fetch AI recommendations
          if (response.data.data.length > 0) {
            const latestBill = response.data.data[0];
            if (latestBill.breakdown) {
              fetchAIRecommendations(latestBill);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch bill history:", error);
        // Don't show error toast for empty data
      } finally {
        setLoadingBills(false);
      }
    };

    fetchBillHistory();
  }, []);

  const fetchAIRecommendations = async (billData: BillRecord) => {
    try {
      setLoadingAI(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post<ApiResponse<AIResult>>(
        `${API_BASE_URL}/api/v1/ai/analyze`,
        {
          billData: {
            breakdown: billData.breakdown || [],
            totalEstimatedUnits: billData.totalEstimatedUnits,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.data.success && response.data.data) {
        setAiRecommendations(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  // Get latest bill for display
  const latestBill = billHistory[0];
  const hasBillData = billHistory.length > 0;

  // Demo chart data (TODO: Replace with real appliance data)
  const dayLabels = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ];
  const lightingData = [45, 52, 48, 55, 50, 53, 47, 51, 49, 54, 52, 48];
  const refrigeratorData = [28, 30, 29, 32, 31, 28, 30, 29, 31, 30, 29, 32];
  const acData = [35, 38, 42, 40, 39, 41, 37, 40, 38, 42, 41, 39];

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
                Date & Time
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
                      {
                        month: "long",
                        year: "numeric",
                      }
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
              <div className="empty-state-content-enhanced">
                <div className="empty-state-icon-container">
                  <div className="empty-icon-circle">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 11H15M9 15H15M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 9H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="empty-state-text">
                  <h3 className="empty-state-title">No Bills Yet</h3>
                  <p className="empty-state-description">
                    Start tracking your energy consumption by adding your first
                    electricity bill. Get insights, predictions, and
                    personalized recommendations.
                  </p>
                </div>

                <div className="empty-state-features">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="7"
                          height="18"
                          rx="2"
                          fill="currentColor"
                          opacity="0.4"
                        />
                        <rect
                          x="13"
                          y="9"
                          width="7"
                          height="12"
                          rx="2"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <span>Track Consumption</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2L9 9H2L8 14L5 22L12 17L19 22L16 14L22 9H15L12 2Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <span>Get Insights</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 17L9 11L13 15L21 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17 7H21V11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span>Save Money</span>
                  </div>
                </div>

                <button
                  className="cta-button"
                  onClick={() => (window.location.href = "/bills")}
                >
                  <span>Add Your First Bill</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Energy Consumption Section - Interactive & Creative */}
        <div
          className="energy-consumption-section fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="section-header-row">
            <h2>Energy Consumption Overview</h2>
            <div className="view-controls">
              <button className="view-btn active">14 Days</button>
              <button className="view-btn">30 Days</button>
            </div>
          </div>

          <div className="appliance-grid-clean">
            {/* Lighting - Interactive Card */}
            <div
              className={`appliance-item interactive-card ${
                expandedCard === "lighting" ? "expanded" : ""
              }`}
              onClick={() =>
                setExpandedCard(expandedCard === "lighting" ? null : "lighting")
              }
            >
              <div className="appliance-header-clean">
                <div className="header-left-section">
                  <div className="appliance-icon lighting-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="appliance-name">Lighting</span>
                    <span className="trend-badge increase">+8.2%</span>
                  </div>
                </div>
                <button
                  className="expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(
                      expandedCard === "lighting" ? null : "lighting"
                    );
                  }}
                >
                  {expandedCard === "lighting" ? "−" : "+"}
                </button>
              </div>

              <div
                className="chart-container"
                style={{
                  height: expandedCard === "lighting" ? "180px" : "140px",
                }}
              >
                <EnergyBarChart
                  data={lightingData}
                  labels={dayLabels}
                  color="#00d9ff"
                  height={expandedCard === "lighting" ? 180 : 140}
                />
              </div>

              <div className="appliance-metric-clean">
                <div className="metric-row">
                  <div className="metric-value">52</div>
                  <div className="metric-change positive">+4 kWh</div>
                </div>
                <div className="metric-label-clean">
                  Average daily consumption
                </div>
              </div>

              {expandedCard === "lighting" && (
                <div className="expanded-details">
                  <div className="detail-row">
                    <span className="detail-label">Peak Hour:</span>
                    <span className="detail-value">8:00 PM</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Monthly Total:</span>
                    <span className="detail-value">1,560 kWh</span>
                  </div>
                </div>
              )}
            </div>

            {/* Refrigerator - Interactive Card */}
            <div
              className={`appliance-item interactive-card ${
                expandedCard === "refrigerator" ? "expanded" : ""
              }`}
              onClick={() =>
                setExpandedCard(
                  expandedCard === "refrigerator" ? null : "refrigerator"
                )
              }
            >
              <div className="appliance-header-clean">
                <div className="header-left-section">
                  <div className="appliance-icon refrigerator-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                        fill="currentColor"
                      />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <span className="appliance-name">Refrigerator</span>
                    <span className="trend-badge decrease">-3.5%</span>
                  </div>
                </div>
                <button
                  className="expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(
                      expandedCard === "refrigerator" ? null : "refrigerator"
                    );
                  }}
                >
                  {expandedCard === "refrigerator" ? "−" : "+"}
                </button>
              </div>

              <div
                className="chart-container"
                style={{
                  height: expandedCard === "refrigerator" ? "180px" : "140px",
                }}
              >
                <EnergyBarChart
                  data={refrigeratorData}
                  labels={dayLabels}
                  color="#a78bfa"
                  height={expandedCard === "refrigerator" ? 180 : 140}
                />
              </div>

              <div className="appliance-metric-clean">
                <div className="metric-row">
                  <div className="metric-value">30</div>
                  <div className="metric-change negative">-2 kWh</div>
                </div>
                <div className="metric-label-clean">
                  Average daily consumption
                </div>
              </div>

              {expandedCard === "refrigerator" && (
                <div className="expanded-details">
                  <div className="detail-row">
                    <span className="detail-label">Running Time:</span>
                    <span className="detail-value">24/7</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Monthly Total:</span>
                    <span className="detail-value">900 kWh</span>
                  </div>
                </div>
              )}
            </div>

            {/* Air Conditioner - Interactive Card */}
            <div
              className={`appliance-item interactive-card ${
                expandedCard === "ac" ? "expanded" : ""
              }`}
              onClick={() =>
                setExpandedCard(expandedCard === "ac" ? null : "ac")
              }
            >
              <div className="appliance-header-clean">
                <div className="header-left-section">
                  <div className="appliance-icon ac-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2v20M5 12h14M8 5l4 4-4 4M16 5l-4 4 4 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="appliance-name">Air Conditioner</span>
                    <span className="trend-badge decrease">-5.1%</span>
                  </div>
                </div>
                <button
                  className="expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(expandedCard === "ac" ? null : "ac");
                  }}
                >
                  {expandedCard === "ac" ? "−" : "+"}
                </button>
              </div>

              <div
                className="chart-container"
                style={{ height: expandedCard === "ac" ? "180px" : "140px" }}
              >
                <EnergyBarChart
                  data={acData}
                  labels={dayLabels}
                  color="#00ff88"
                  height={expandedCard === "ac" ? 180 : 140}
                />
              </div>

              <div className="appliance-metric-clean">
                <div className="metric-row">
                  <div className="metric-value">40</div>
                  <div className="metric-change negative">-3 kWh</div>
                </div>
                <div className="metric-label-clean">
                  Average daily consumption
                </div>
              </div>

              {expandedCard === "ac" && (
                <div className="expanded-details">
                  <div className="detail-row">
                    <span className="detail-label">Peak Hour:</span>
                    <span className="detail-value">2:00 PM</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Monthly Total:</span>
                    <span className="detail-value">1,200 kWh</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Smart Recommendations Section - Progressive Loading */}
        <div
          className="recommendations-section fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h2
            style={{
              marginBottom: "var(--spacing-xl)",
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            Smart Recommendations
            {hasBillData && (
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  fontWeight: 400,
                  marginLeft: "var(--spacing-md)",
                }}
              >
                Based on your bill analysis
              </span>
            )}
          </h2>

          {loadingAI ? (
            <div className="recommendations-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="recommendation-skeleton">
                  <div
                    className="skeleton-text"
                    style={{ width: "70%", height: "20px" }}
                  ></div>
                  <div
                    className="skeleton-text"
                    style={{ width: "100%", height: "16px", marginTop: "12px" }}
                  ></div>
                  <div
                    className="skeleton-text"
                    style={{ width: "90%", height: "16px", marginTop: "8px" }}
                  ></div>
                </div>
              ))}
            </div>
          ) : aiRecommendations && aiRecommendations.suggestions ? (
            <div className="recommendations-grid">
              {aiRecommendations.suggestions.map((suggestion, index) => (
                <SmartRecommendation
                  key={index}
                  priority={
                    index === 0 ? "high" : index === 1 ? "medium" : "low"
                  }
                  category="energy"
                  title={suggestion.strategy || `Optimize ${suggestion.name}`}
                  description={suggestion.strategy}
                  savings={{
                    amount: `₹${suggestion.savedAmount}/month (${Math.round(
                      suggestion.reductionPercentage * 100
                    )}%)`,
                    energy: `${Math.round(
                      suggestion.reductionPercentage *
                        (latestBill?.totalEstimatedUnits || 0)
                    )} kWh`,
                  }}
                  onAction={() => console.log("Action clicked")}
                  onDismiss={() => console.log("Dismissed")}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">💡</span>
              <p className="empty-title">No recommendations available</p>
              <p className="empty-subtitle">
                {hasBillData
                  ? "Add more bills to get personalized recommendations"
                  : "Start by adding your electricity bill"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
