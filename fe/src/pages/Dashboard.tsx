import React, { useState, useEffect } from "react";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import SmartRecommendation from "../components/SmartRecommendation";
import EnergyBarChart from "../components/EnergyBarChart";
import { RelativeTimeCard } from "../components/ui/relative-time-card";
import { billsAPI, aiAPI } from "../utils/api";
import type { BillRecord, AIResult } from "../types";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(Date.now());
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
        const response = await billsAPI.getHistory();
        if (response.success && response.data) {
          setBillHistory(response.data);

          // If we have bill data, fetch AI recommendations
          if (response.data.length > 0) {
            const latestBill = response.data[0];
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
      // Ensure specific fields are passed
      const response = await aiAPI.analyze({
        breakdown: billData.breakdown || [],
        totalEstimatedUnits: billData.totalEstimatedUnits,
      });
      if (response.success && response.data) {
        setAiRecommendations(response.data);
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
      <AnimatedNavBar />

      <div className="dashboard-container">
        {/* Header - Always visible */}
        <div className="dashboard-header-new">
          <h1>Overview</h1>
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
            <div className="bill-card-minimal empty-state fade-in">
              <div className="empty-state-content">
                <span className="empty-icon">📊</span>
                <p className="empty-title">No bill data yet</p>
                <p className="empty-subtitle">
                  Add your first bill to start tracking
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Energy Consumption Section - Show demo charts for now */}
        <div
          className="energy-consumption-section fade-in"
          style={{ animationDelay: "0.1s" }}
        >
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
              <div style={{ height: "140px", width: "100%" }}>
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
              <div style={{ height: "140px", width: "100%" }}>
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
              <div style={{ height: "140px", width: "100%" }}>
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
