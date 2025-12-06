import React, { useState, useCallback } from "react";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import { billsAPI } from "../utils/api";
import type { BillData, ParsedBillData, UploadedBill } from "../types";
import toast from "react-hot-toast";
import "./Bills.css";
import { useNavigate } from "react-router-dom";

const Bills: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<UploadedBill[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Form State
  const [manualData, setManualData] = useState<BillData>({
    billMonth: "",
    totalAmount: 0,
    unitsConsumed: 0,
    dueDate: "",
    consumerName: "",
    consumerNumber: "",
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    const newBill: UploadedBill = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date(),
      status: "uploading",
    };

    setBills([newBill]); // Only handle one bill at a time for this flow

    try {
      // 1. Upload
      setBills((prev) =>
        prev.map((b) =>
          b.id === newBill.id ? { ...b, status: "processing" } : b
        )
      );

      const response = await billsAPI.uploadPdf(file);
      const parsedData: ParsedBillData = response.data;

      // Map API response to our state
      const extracted: BillData = {
        billMonth: parsedData.billingPeriod || "",
        totalAmount: parsedData.totalAmount || 0,
        unitsConsumed: parsedData.totalUnits || 0,
        dueDate: "", // AI might not extract due date
        consumerName: parsedData.consumerName || "",
        consumerNumber: parsedData.consumerNumber || "",
      };

      setBills((prev) =>
        prev.map((b) =>
          b.id === newBill.id
            ? {
                ...b,
                status: "completed",
                extractedData: extracted,
              }
            : b
        )
      );

      // Populate manual form for editing
      setManualData(extracted);
      setShowManualForm(true);
      toast.success("Bill uploaded and analyzed successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      setBills((prev) =>
        prev.map((b) => (b.id === newBill.id ? { ...b, status: "error" } : b))
      );
      toast.error("Failed to analyze bill. Please enter details manually.");
      setShowManualForm(true); // Fallback to manual entry
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualData((prev) => ({
      ...prev,
      [name]:
        name === "totalAmount" || name === "unitsConsumed"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSaveAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Pass this data to the Appliances page via navigation state
      navigate("/appliances", { state: { billData: manualData } });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bills-page">
      <AnimatedNavBar />

      <div className="bills-container">
        <div className="bills-header">
          <h1>Electricity Bill Upload</h1>
          <p className="bills-subtitle">
            Upload your bill PDF or enter details manually
          </p>
        </div>

        {/* Upload Area - Hide if showing form */}
        {!showManualForm && (
          <div
            className={`bill-upload-area ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">📄</div>
            <h3 className="upload-title">Drag & drop your bill PDF here</h3>
            <p className="upload-description">
              AI will extract the details for you
            </p>
            <p className="upload-formats">Max 10MB</p>

            <input
              type="file"
              id="bill-file-input"
              className="file-input-hidden"
              accept=".pdf"
              onChange={handleFileSelect}
            />
            <label htmlFor="bill-file-input" className="upload-button">
              Choose File
            </label>

            <div className="manual-entry-link">
              <button
                className="text-btn"
                onClick={() => setShowManualForm(true)}
              >
                Or enter details manually
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {bills.length > 0 && bills[0].status === "processing" && (
          <div className="processing-state-card">
            <div className="spinner"></div>
            <p>Analyzing your bill with AI...</p>
          </div>
        )}

        {/* Manual/Edit Form */}
        {showManualForm && (
          <div className="manual-form-card">
            <h2>
              {bills.length > 0 && bills[0].status === "completed"
                ? "Review & Confirmation"
                : "Enter Bill Details"}
            </h2>
            <p className="form-subtitle">
              {bills.length > 0 && bills[0].status === "completed"
                ? "Please verify the extracted details below."
                : "Please fill in the details from your electricity bill."}
            </p>

            <form onSubmit={handleSaveAndProceed}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bill Month/Period</label>
                  <input
                    type="text"
                    name="billMonth"
                    value={manualData.billMonth}
                    onChange={handleManualInputChange}
                    placeholder="e.g. Oct 2023"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount (₹)</label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={manualData.totalAmount || ""}
                    onChange={handleManualInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Units Consumed (kWh)</label>
                  <input
                    type="number"
                    name="unitsConsumed"
                    value={manualData.unitsConsumed || ""}
                    onChange={handleManualInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Consumer Number (Optional)</label>
                  <input
                    type="text"
                    name="consumerNumber"
                    value={manualData.consumerNumber}
                    onChange={handleManualInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowManualForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Confirm & Proceed"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;
