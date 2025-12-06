import React, { useEffect, useState } from "react";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import { useLocation, useNavigate } from "react-router-dom";
import { appliancesAPI, billsAPI, aiAPI } from "../utils/api";
import type {
  BillData,
  EstimatedData,
  ComparisonResult,
  AIResult,
  Appliance,
  BreakdownItem,
} from "../types";
import toast from "react-hot-toast";
import { Leaf, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import "./Estimation.css";

interface AnalysisResult {
  comparison: ComparisonResult;
  estimation: EstimatedData;
  ai: AIResult | null;
}

const Estimation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const billData: BillData | undefined = location.state?.billData;

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!billData) {
      toast.error("Missing bill data");
      navigate("/bills");
      return;
    }

    const runInitialAnalysis = async () => {
      try {
        setLoading(true);
        // 1. Fetch Appliances
        const appRes = await appliancesAPI.getAll();
        const userAppliances = appRes.data || [];

        if (userAppliances.length === 0) {
          toast.error("No appliances found!");
        }

        // 2. Estimate
        const rate = 8; // Default rate
        const mappedApps = userAppliances.map((a: Appliance) => ({
          name: a.name,
          count: a.count,
          hours: a.defaultUsageHours,
          watts: a.wattage,
        }));

        const estRes = await billsAPI.estimate(rate, mappedApps);
        const estimatedData = estRes.data;

        // 3. Compare
        const compRes = await billsAPI.compare(
          billData.totalAmount,
          estimatedData
        );
        const comparisonData = compRes.data;

        setResults({
          comparison: comparisonData,
          estimation: estimatedData,
          ai: null,
        });

        // 4. Trigger AI Analysis automatically
        runAIAnalysis(
          comparisonData.normalizedBreakdown,
          billData.unitsConsumed
        );
      } catch (error) {
        console.error("Analysis failed", error);
        toast.error("Analysis failed");
      } finally {
        setLoading(false);
      }
    };

    runInitialAnalysis();
  }, [billData, navigate]);

  const runAIAnalysis = async (
    breakdown: BreakdownItem[],
    totalUnits: number
  ) => {
    try {
      setAnalyzing(true);
      const aiRes = await aiAPI.analyze({
        breakdown: breakdown,
        totalEstimatedUnits: totalUnits,
      });
      const aiData = aiRes.data;
      setResults((prev) => (prev ? { ...prev, ai: aiData } : null));
    } catch {
      console.error("AI Analysis failed");
      toast.error("AI Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!results || !billData) return;
    try {
      const payload = {
        userId: "current-user",
        totalEstimatedUnits: results.estimation.totalUnits,
        totalEstimatedCost: results.estimation.totalCost,
        actualBillAmount: billData.totalAmount,
        discrepancyRatio: results.comparison.discrepancyRatio,
        breakdown: results.comparison.normalizedBreakdown,
      };
      await billsAPI.save(payload);
      toast.success("Analysis saved to history!");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save record");
    }
  };

  // Safe navigation if billData is missing happens in useEffect, but for types, check billData
  if (!billData) return null;

  if (loading)
    return (
      <div className="estimation-page">
        <AnimatedNavBar />
        <div
          className="estimation-container"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "100px",
          }}
        >
          <div className="spinner"></div>
          <p style={{ marginLeft: "10px" }}>Crunching the numbers...</p>
        </div>
      </div>
    );

  if (!results) return null;

  const { comparison, ai } = results;
  const isHighDiscrepancy = comparison.discrepancyRatio > 1.2;

  return (
    <div className="estimation-page">
      <AnimatedNavBar />
      <div className="estimation-container">
        <div className="estimation-header">
          <h1>Bill Analysis Report</h1>
          <p>Comparison and AI-powered Insights</p>
        </div>

        {/* Comparison Section */}
        <div className="comparison-section">
          <div className="comparison-card">
            <h3>Actual Bill</h3>
            <span className="big-number">₹{billData.totalAmount}</span>
            <p>{billData.unitsConsumed} kWh</p>
          </div>
          <div className="comparison-card">
            <h3>Estimated Cost</h3>
            <span className="big-number">₹{results.estimation.totalCost}</span>
            <p>Based on your appliances</p>
          </div>

          <div
            className={`comparison-card discrepancy-card ${
              !isHighDiscrepancy ? "safe" : ""
            }`}
          >
            <h3>
              {isHighDiscrepancy ? (
                <AlertTriangle size={24} style={{ verticalAlign: "middle" }} />
              ) : (
                <CheckCircle size={24} style={{ verticalAlign: "middle" }} />
              )}{" "}
              Analysis Status
            </h3>
            <p>
              {isHighDiscrepancy
                ? `Your bill is ${Math.round(
                    (comparison.discrepancyRatio - 1) * 100
                  )}% higher than estimated! This suggests some appliances might be missing or usage is higher.`
                : "Your usage matches your appliances well. Great job!"}
            </p>
            {isHighDiscrepancy && (
              <button
                className="update-appliances-btn"
                onClick={() => navigate("/appliances", { state: { billData } })}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  color: "inherit",
                }}
              >
                Refine Appliances
              </button>
            )}
          </div>
        </div>

        {/* AI Section */}
        {analyzing ? (
          <div className="ai-loading">
            <div className="spinner"></div>
            <p>
              AI Agents are analyzing your carbon footprint and finding
              savings...
            </p>
          </div>
        ) : ai ? (
          <div className="ai-section">
            {/* CO2 Card */}
            <div className="co2-card">
              <h3>
                <Leaf size={24} /> Environmental Impact
              </h3>
              <span className="big-number">{ai.carbonFootprint} kg</span>
              <p>CO2 Emissions this month</p>

              {ai.impact && (
                <div className="impact-details">
                  <p>
                    🌲 Equivalent to <strong>{ai.impact.trees} trees</strong>{" "}
                    needed to offset.
                  </p>
                  <p>
                    🚗 Equivalent to driving{" "}
                    <strong>{ai.impact.carKm} km</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="recommendations-list">
              <h3>
                <TrendingDown size={24} /> Savings Recommendations
              </h3>
              {ai.suggestions &&
                ai.suggestions.map((rec, idx) => (
                  <div key={idx} className="rec-item">
                    <h4>{rec.name}</h4>
                    <p>{rec.strategy}</p>
                    <p style={{ color: "green", fontWeight: "bold" }}>
                      Potential Save: ₹{rec.savedAmount} (
                      {Math.round(rec.reductionPercentage * 100)}%)
                    </p>
                  </div>
                ))}
              <div className="total-savings">
                <h4>
                  Total Potential Monthly Savings: ₹{ai.totalPotentialSavings}
                </h4>
              </div>
            </div>
          </div>
        ) : null}

        <div className="save-section">
          <button className="save-btn" onClick={handleSave}>
            Save to History & Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Estimation;
