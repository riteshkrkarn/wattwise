import React, { useState, useCallback } from 'react';
import { AnimatedNavBar } from '../components/AnimatedNavBar';
import './Bills.css';

interface UploadedBill {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  extractedData?: {
    billMonth: string;
    totalAmount: number;
    unitsConsumed: number;
    dueDate: string;
    consumerName?: string;
    consumerNumber?: string;
  };
}

const Bills: React.FC = () => {
  const [bills, setBills] = useState<UploadedBill[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      // Create new bill entry
      const newBill: UploadedBill = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date(),
        status: 'uploading'
      };

      setBills(prev => [newBill, ...prev]);

      // Simulate upload progress
      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(uploadInterval);
          // Change status to processing
          setBills(prev => prev.map(b => 
            b.id === newBill.id ? { ...b, status: 'processing' } : b
          ));

          // Simulate AI processing
          setTimeout(() => {
            setBills(prev => prev.map(b => 
              b.id === newBill.id ? {
                ...b,
                status: 'completed',
                extractedData: {
                  billMonth: 'November 2025',
                  totalAmount: 3240,
                  unitsConsumed: 462,
                  dueDate: '15 Dec 2025',
                  consumerName: 'User Name',
                  consumerNumber: 'CONS123456'
                }
              } : b
            ));
          }, 3000);
        }
      }, 200);
    });
  };

  const handleDeleteBill = (billId: string) => {
    setBills(prev => prev.filter(bill => bill.id !== billId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bills-page">
      <AnimatedNavBar />
      
      <div className="bills-container">
        <div className="bills-header">
          <h1>Electricity Bills</h1>
          <p className="bills-subtitle">Upload your bills for AI-powered insights and analysis</p>
        </div>

        {/* Upload Area */}
        <div 
          className={`bill-upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📄</div>
          <h3 className="upload-title">Drag & drop your bill here</h3>
          <p className="upload-description">or click to browse files</p>
          <p className="upload-formats">Supports PDF, JPG, PNG (Max 10MB)</p>
          
          <input
            type="file"
            id="bill-file-input"
            className="file-input-hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleFileSelect}
          />
          <label htmlFor="bill-file-input" className="upload-button">
            Choose File
          </label>
        </div>

        {/* Bills List */}
        <div className="bills-list">
          <h2 className="list-title">Uploaded Bills</h2>
          
          {bills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p className="empty-text">No bills uploaded yet</p>
              <p className="empty-subtext">Upload your first bill to get AI-powered insights</p>
            </div>
          ) : (
            <div className="bills-grid">
              {bills.map(bill => (
                <div key={bill.id} className={`bill-card status-${bill.status}`}>
                  <div className="bill-card-header">
                    <div className="bill-file-info">
                      <div className="file-icon">
                        {bill.status === 'completed' ? '✓' : 
                         bill.status === 'processing' ? '⚙️' : 
                         bill.status === 'error' ? '⚠️' : '📄'}
                      </div>
                      <div>
                        <h4 className="bill-file-name">{bill.fileName}</h4>
                        <p className="bill-file-meta">
                          {formatFileSize(bill.fileSize)} • {bill.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="bill-card-actions">
                      <div className={`bill-status-badge status-${bill.status}`}>
                        {bill.status === 'uploading' && 'Uploading...'}
                        {bill.status === 'processing' && 'Processing...'}
                        {bill.status === 'completed' && 'Ready'}
                        {bill.status === 'error' && 'Error'}
                      </div>
                      <button 
                        className="delete-bill-btn" 
                        onClick={() => handleDeleteBill(bill.id)}
                        title="Delete bill"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {bill.status === 'uploading' && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{uploadProgress}%</span>
                    </div>
                  )}

                  {bill.status === 'processing' && (
                    <div className="processing-state">
                      <div className="spinner"></div>
                      <p>AI is extracting bill details...</p>
                    </div>
                  )}

                  {bill.status === 'completed' && bill.extractedData && (
                    <div className="extracted-data">
                      <div className="data-row">
                        <span className="data-label">Bill Month</span>
                        <span className="data-value">{bill.extractedData.billMonth}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Total Amount</span>
                        <span className="data-value amount-highlight">₹{bill.extractedData.totalAmount}</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Units Consumed</span>
                        <span className="data-value">{bill.extractedData.unitsConsumed} kWh</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Due Date</span>
                        <span className="data-value">{bill.extractedData.dueDate}</span>
                      </div>
                      <button className="view-insights-btn">
                        View Insights →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bills;
