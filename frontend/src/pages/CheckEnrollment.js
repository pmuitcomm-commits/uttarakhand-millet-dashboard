import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkEnrollmentStatus } from "../services/api";
import "../styles/enrollment.css";

const mobilePattern = /^\d{10}$/;

const farmerFields = [
  ["Farmer ID", "farmer_id"],
  ["Name", "name"],
  ["Father / Husband Name", "father_husband_name"],
  ["Mobile", "mobile"],
  ["Email", "email"],
  ["Address", "address"],
  ["District", "district_name"],
  ["Block", "block_name"],
  ["Group President Name", "group_president_name"],
  ["Account Holder Name", "account_holder_name"],
  ["Bank Account Number", "bank_account_number"],
  ["Bank IFSC", "bank_ifsc"],
  ["Bank Name and Address", "bank_name_address"],
  ["Crops", "crops"],
  ["Estimated Seed Date", "estimated_seed_date"],
  ["Estimated Yield", "estimated_yield"],
  ["Created At", "created_at"],
];

const landParcelFields = [
  ["Land ID", "land_id"],
  ["Khatauni Number", "khatauni_number"],
  ["Khasra Number", "khasra_number"],
  ["Area Value", "area_value"],
  ["Area Unit", "area_unit"],
  ["Ownership Type", "ownership_type"],
  ["Cultivator Name", "cultivator_name"],
  ["Lease Period", "lease_period"],
  ["Created At", "created_at"],
];

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function CheckEnrollment() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);

  const handleInputChange = (event) => {
    const numericValue = event.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(numericValue);
    setError("");
    setNoData(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mobilePattern.test(mobile.trim())) {
      setEnrollmentData(null);
      setNoData(false);
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    setError("");
    setNoData(false);
    setEnrollmentData(null);

    try {
      const response = await checkEnrollmentStatus(mobile.trim());
      setEnrollmentData(response.data);
    } catch (apiError) {
      const statusCode = apiError.response?.status;
      const detail = apiError.response?.data?.detail;

      if (statusCode === 404) {
        setNoData(true);
      } else {
        setError(detail || "Unable to fetch enrollment status. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setMobile("");
    setLoading(false);
    setError("");
    setNoData(false);
    setEnrollmentData(null);
  };

  return (
    <div className="enrollment-container">
      <div className="enrollment-header">
        <div className="logo-section">
          <div className="title-section">
            <h1>Government of Uttarakhand</h1>
            <h2>Farmer Enrollment Status</h2>
            <h3>Check registration details using mobile number</h3>
          </div>
        </div>
      </div>

      <div className="enrollment-content">
        <div className="enrollment-card">
          <div className="card-header">
            <h2>Check Enrollment Status</h2>
            <p>Enter the registered mobile number to fetch farmer details.</p>
          </div>

          <form onSubmit={handleSubmit} className="enrollment-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="back-btn"
              >
                Back to Login
              </button>
              <button type="submit" className="check-btn" disabled={loading}>
                {loading ? "Checking..." : "Check Status"}
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <h3>Checking Enrollment Status...</h3>
            <p>Please wait while we fetch the farmer record.</p>
          </div>
        )}

        {noData && !loading && (
          <div className="results-card">
            <div className="results-header">
              <h2>No Enrollment Found</h2>
            </div>
            <p>No farmer record was found for this mobile number.</p>
            <div className="results-actions">
              <button onClick={handleNewSearch} className="new-search-btn">
                New Search
              </button>
            </div>
          </div>
        )}

        {enrollmentData && !loading && (
          <div className="results-card">
            <div className="results-header">
              <h2>Enrollment Details</h2>
              <div className="status-badge enrolled">Found</div>
            </div>

            <div className="farmer-details">
              <div className="detail-section">
                <h3>Farmer Details</h3>
                <div className="detail-grid">
                  {farmerFields.map(([label, key]) => (
                    <div className="detail-item" key={key}>
                      <span className="label">{label}:</span>
                      <span className="value">
                        {formatValue(enrollmentData.farmer?.[key])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Land Parcels</h3>
                {enrollmentData.land_parcels?.length ? (
                  enrollmentData.land_parcels.map((parcel) => (
                    <div className="detail-grid" key={parcel.land_id}>
                      {landParcelFields.map(([label, key]) => (
                        <div className="detail-item" key={`${parcel.land_id}-${key}`}>
                          <span className="label">{label}:</span>
                          <span className="value">{formatValue(parcel[key])}</span>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p>No land parcels found for this farmer.</p>
                )}
              </div>
            </div>

            <div className="results-actions">
              <button onClick={handleNewSearch} className="new-search-btn">
                New Search
              </button>
              <button onClick={() => navigate("/")} className="login-btn">
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="enrollment-footer">
        <p>Government of Uttarakhand | Millet Development Programme</p>
      </div>
    </div>
  );
}

export default CheckEnrollment;
