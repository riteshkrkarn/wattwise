import React, { useState, useEffect } from "react";
import axios from "axios";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { useLocation, useNavigate } from "react-router-dom";
import type { Appliance, Preset, BillData, ApiResponse } from "../types";
import toast from "react-hot-toast";
import { Wind, Refrigerator, Fan, Lightbulb, Tv, Plug } from "lucide-react";
import "./Appliances.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Appliances: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const billData: BillData | undefined = location.state?.billData;

  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: "Other",
    name: "",
    wattage: "",
    count: "1",
    dailyUsage: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const [presetsRes, appliancesRes] = await Promise.all([
        axios.get<ApiResponse<Preset[]>>(
          `${API_BASE_URL}/api/v1/bills/presets`,
          { headers }
        ),
        axios.get<ApiResponse<Appliance[]>>(
          `${API_BASE_URL}/api/v1/appliances`,
          { headers }
        ),
      ]);

      setPresets(presetsRes.data.data || []);
      setAppliances(appliancesRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load appliances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const preset = presets.find((p) => p.name === selectedName);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        name: preset.name,
        wattage: preset.wattage.toString(),
        // Simple heuristic for category mapping based on name
        category: mapCategory(preset.name),
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: selectedName }));
    }
  };

  const mapCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("ac") || n.includes("conditioner") || n.includes("fan"))
      return "Cooling";
    if (n.includes("geyser") || n.includes("heater")) return "Heating";
    if (n.includes("bulb") || n.includes("light") || n.includes("tube"))
      return "Lighting";
    if (n.includes("tv") || n.includes("television")) return "Entertainment";
    if (n.includes("microwave") || n.includes("kettle") || n.includes("oven"))
      return "Kitchen";
    if (n.includes("washing") || n.includes("dryer")) return "Laundry";
    if (n.includes("fridge") || n.includes("refrigerator")) return "Kitchen";
    return "Other";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_BASE_URL}/api/v1/appliances`,
        {
          category: formData.category,
          name: formData.name,
          wattage: Number(formData.wattage),
          count: Number(formData.count),
          defaultUsageHours: Number(formData.dailyUsage),
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      toast.success("Appliance added");
      setShowForm(false);
      setFormData({
        category: "Other",
        name: "",
        wattage: "",
        count: "1",
        dailyUsage: "",
      });

      // Refresh list
      const res = await axios.get<ApiResponse<Appliance[]>>(
        `${API_BASE_URL}/api/v1/appliances`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      setAppliances(res.data.data || []);
    } catch {
      toast.error("Failed to add appliance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_BASE_URL}/api/v1/appliances/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      setAppliances((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appliance deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleProceed = () => {
    if (!billData) {
      toast.error("No bill data found. Please upload a bill first.");
    }
    navigate("/estimation", { state: { billData } });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "air_conditioner":
        return <Wind size={24} />;
      case "refrigerator":
        return <Refrigerator size={24} />;
      case "fan":
        return <Fan size={24} />;
      case "lighting":
        return <Lightbulb size={24} />;
      case "television":
        return <Tv size={24} />;
      default:
        return <Plug size={24} />;
    }
  };

  if (loading)
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading appliances...</p>
      </div>
    );

  return (
    <div className="appliances-page">
      <AnimatedBackground />
      <AnimatedNavBar />
      <div className="appliances-container">
        <div className="appliances-header">
          <h1>My Appliances</h1>
          <p>Manage your appliances to get accurate energy estimates.</p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button
            className="add-appliance-btn"
            onClick={() => setShowForm(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Add New Appliance</span>
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="appliance-form-card">
            <h3>Add New Appliance</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select from Presets</label>
                <select
                  onChange={handlePresetChange}
                  value={formData.name || ""}
                >
                  <option value="">-- Custom --</option>
                  {presets.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.wattage}W)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Other">Other</option>
                    <option value="Cooling">Cooling (AC, Fans)</option>
                    <option value="Heating">Heating (Geyser, Heater)</option>
                    <option value="Kitchen">Kitchen (Microwave, Kettle)</option>
                    <option value="Laundry">Laundry (Washing Machine)</option>
                    <option value="Lighting">Lighting (Bulbs, Tubes)</option>
                    <option value="Entertainment">
                      Entertainment (TV, Gaming)
                    </option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Wattage (W)</label>
                  <input
                    type="number"
                    name="wattage"
                    value={formData.wattage}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Count</label>
                  <input
                    type="number"
                    name="count"
                    value={formData.count}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Daily Usage (Hours)</label>
                  <input
                    type="number"
                    name="dailyUsage"
                    value={formData.dailyUsage}
                    onChange={handleInputChange}
                    required
                    step="0.5"
                    max="24"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Appliance"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="appliances-list">
          {appliances.length === 0 ? (
            <div className="empty-state">No appliances added yet.</div>
          ) : (
            appliances.map((app) => (
              <div key={app._id} className="appliance-item">
                <div className="app-icon">{getCategoryIcon(app.category)}</div>
                <div className="app-info">
                  <h4>{app.name}</h4>
                  <p>
                    {app.count} x {app.wattage}W • {app.defaultUsageHours}{" "}
                    hrs/day
                  </p>
                </div>
                <button
                  className="delete-btn-icon"
                  onClick={() => handleDelete(app._id)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Action */}
        <div className="appliances-footer">
          <button className="proceed-btn" onClick={handleProceed}>
            <span>Proceed to Analytics</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appliances;
