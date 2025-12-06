import React, { useState, useCallback } from "react";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { billsAPI } from "../utils/api";
import type {
  BillData,
  ParsedBillData,
  UploadedBill,
  ApiResponse,
} from "../types";
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

  const [uploadStage, setUploadStage] = useState<string>("");

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

    console.log("🚀 [Frontend] Starting file upload for:", file.name);
    setBills([newBill]);
    setUploadStage("Uploading PDF...");

    try {
      setBills((prev) =>
        prev.map((b) =>
          b.id === newBill.id ? { ...b, status: "processing" } : b
        )
      );

      // Simulate stages for better UX since backend does it all in one go
      // In a real streaming architecture, we'd listen to server events.
      setTimeout(() => setUploadStage("Parsing Document Structure..."), 1500);
      setTimeout(() => setUploadStage("Extracting Billing Details..."), 3500);
      setTimeout(() => setUploadStage("Validating Data with AI..."), 5500);

      console.log("📤 [Frontend] Calling billsAPI.uploadPdf...");

      // Use the proper API function which includes interceptors and auth
      const response = await billsAPI.uploadPdf(file);

      console.log("📥 [Frontend] Received response:", response);

      const parsedData = response.data as ParsedBillData;
      console.log("✅ [Frontend] Parsed Data:", parsedData);

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
      toast.success("Bill analyzed successfully!");
    } catch (error: unknown) {
      console.error("❌ [Frontend] Upload/Analysis Error:", error);

      // Update bill status to failed
      setBills((prev) =>
        prev.map((b) => (b.id === newBill.id ? { ...b, status: "failed" } : b))
      );

      // Extract error message
      let errorMessage = "Failed to analyze bill. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setUploadStage("");
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
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bills-page">
      <AnimatedBackground />
      <AnimatedNavBar />

      <div className="bills-container">
        <div className="bills-header">
          <h1>Upload Your Bill</h1>
          <p className="bills-subtitle">
            Upload your PDF bill or enter details manually for AI-powered
            analysis
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
            <div className="upload-icon-container">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 18C4.23858 18 2 15.7614 2 13C2 10.7909 3.46819 8.92709 5.5 8.27709C6.02167 5.11537 8.83428 2.75 12.2 2.75C15.5657 2.75 18.3783 5.11537 18.9 8.27709C20.9318 8.92709 22.4 10.7909 22.4 13C22.4 15.7614 20.1614 18 17.4 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12L12 21M12 12L9 15M12 12L15 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="upload-content">
              <h3 className="upload-title">Drag & drop your bill PDF here</h3>
              <p className="upload-description">
                Our AI will automatically extract all details
              </p>
              <p className="upload-formats">PDF • Max 10MB</p>
            </div>

            <input
              type="file"
              id="bill-file-input"
              className="file-input-hidden"
              accept=".pdf"
              onChange={handleFileSelect}
            />

            <label htmlFor="bill-file-input" className="upload-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v16m8-8H4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Choose File</span>
            </label>

            <div className="divider-line">
              <span>OR</span>
            </div>

            <button
              className="manual-entry-btn"
              onClick={() => setShowManualForm(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M18.5 2.5L21.5 5.5L12 15H9V12L18.5 2.5Z"
                  fill="currentColor"
                />
              </svg>
              <span>Enter Details Manually</span>
            </button>
          </div>
        )}

        {/* Processing State */}
        {bills.length > 0 && bills[0].status === "processing" && (
          <div className="processing-state-card">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h3>Analyzing Your Bill</h3>
            <p className="animate-pulse-slow">
              {uploadStage || "Processing..."}
            </p>
          </div>
        )}

        {/* Manual/Edit Form */}
        {showManualForm && (
          <div className="manual-form-card">
            <div className="form-header">
              <h2>
                {bills.length > 0 && bills[0].status === "completed"
                  ? "Review & Confirm Details"
                  : "Enter Bill Details"}
              </h2>
              <p className="form-subtitle">
                {bills.length > 0 && bills[0].status === "completed"
                  ? "AI extracted these details. Please verify and correct if needed."
                  : "Fill in the details from your electricity bill"}
              </p>
            </div>

            <form onSubmit={handleSaveAndProceed}>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="3"
                        y1="10"
                        x2="21"
                        y2="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="8"
                        y1="14"
                        x2="10"
                        y2="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Bill Month/Period
                  </label>
                  <input
                    type="text"
                    name="billMonth"
                    value={manualData.billMonth}
                    onChange={handleManualInputChange}
                    placeholder="e.g. November 2024"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2v20M17 5H9.5C7.01472 5 5 7.01472 5 9.5v0C5 11.9853 7.01472 14 9.5 14H14.5C16.9853 14 19 16.0147 19 18.5v0C19 20.9853 16.9853 23 14.5 23H6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={manualData.totalAmount || ""}
                    onChange={handleManualInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                        fill="currentColor"
                      />
                    </svg>
                    Units Consumed (kWh)
                  </label>
                  <input
                    type="number"
                    name="unitsConsumed"
                    value={manualData.unitsConsumed || ""}
                    onChange={handleManualInputChange}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    Consumer Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="consumerNumber"
                    value={manualData.consumerNumber}
                    onChange={handleManualInputChange}
                    placeholder="Enter consumer number"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowManualForm(false)}
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting ? "Processing..." : "Confirm & Continue"}
                  </span>
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;
