import React, { useState } from "react";
import { AnimatedNavBar } from "../components/AnimatedNavBar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Profile state - initialized directly from user context
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    city: user?.city || "",
  });

  // Electricity rate state
  const [electricityRate, setElectricityRate] = useState(7);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update profile:", profileData);
    alert("Profile updated successfully!");
  };

  const handleRateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update rate:", electricityRate);
    alert(`Electricity rate set to ₹${electricityRate}/kWh`);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Change password");
    alert("Password changed successfully!");
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    console.log("Delete account");
    alert("Account deleted");
    logout();
    navigate("/");
  };

  return (
    <div className="settings-page">
      <AnimatedNavBar />

      <div className="settings-container">
        <h1>Settings</h1>

        {/* Profile Section */}
        <div className="settings-section">
          <h2>Profile</h2>
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="profile-form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  value={profileData.city}
                  onChange={(e) =>
                    setProfileData({ ...profileData, city: e.target.value })
                  }
                  required
                >
                  <option value="">Select city</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Pune">Pune</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Update Profile
            </button>
          </form>
        </div>

        {/* Electricity Rate Section */}
        <div className="settings-section">
          <h2>Electricity Rate</h2>
          <form onSubmit={handleRateUpdate} className="settings-form">
            <div className="form-group">
              <label htmlFor="rate">Rate per Unit (₹/kWh)</label>
              <input
                type="number"
                id="rate"
                value={electricityRate}
                onChange={(e) => setElectricityRate(Number(e.target.value))}
                min="1"
                max="50"
                step="0.1"
                required
              />
              <small className="form-hint">
                This affects all cost calculations in the dashboard
              </small>
            </div>

            <button type="submit" className="btn-primary">
              Save Rate
            </button>
          </form>
        </div>

        {/* Account Section */}
        <div className="settings-section">
          <h2>Account</h2>
          <div className="account-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
            <button
              className="btn-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p className="warning-text">
              ⚠️ This action is permanent and cannot be undone. All your data
              will be deleted.
            </p>
            <p>Are you sure you want to delete your account?</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteAccount}>
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
