import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/check-enrollment-status.css';

function CheckEnrollmentStatus() {
  const [checkType, setCheckType] = useState('aadhaar');
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const getInputLabel = () => {
    switch (checkType) {
      case 'aadhaar':
        return 'Aadhaar Number';
      case 'enrollmentId':
        return 'Enrollment ID';
      case 'farmerId':
        return 'Farmer ID';
      default:
        return 'Aadhaar Number';
    }
  };

  const getInputPlaceholder = () => {
    switch (checkType) {
      case 'aadhaar':
        return 'Enter Aadhaar Number (12 digits)';
      case 'enrollmentId':
        return 'Enter Enrollment ID';
      case 'farmerId':
        return 'Enter Farmer ID';
      default:
        return 'Enter Aadhaar Number (12 digits)';
    }
  };

  const handleCheckStatus = () => {
    if (inputValue.trim()) {
      console.log(`Checking ${checkType}: ${inputValue}`);
      // Mock API call - in real app this would fetch from backend
      alert(`Checking ${getInputLabel()}: ${inputValue}`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const isInputFilled = inputValue.trim().length > 0;

  return (
    <div className="ces-container">
      <div className="ces-background">
        {/* Decorative top bar */}
        <div className="ces-top-bar"></div>

        {/* Main content */}
        <div className="ces-content-wrapper">
          <div className="ces-card">
            {/* Header */}
            <div className="ces-header">
              <h1 className="ces-title">Check Enrollment Status</h1>
              <p className="ces-subtitle">
                Check your enrollment status using any of the below options
              </p>
            </div>

            {/* Check Status Against Section */}
            <div className="ces-section">
              <h2 className="ces-section-title">Check Status Against</h2>

              {/* Radio Buttons */}
              <div className="ces-radio-group">
                <div className="ces-radio-item">
                  <input
                    type="radio"
                    id="aadhaar"
                    name="checkType"
                    value="aadhaar"
                    checked={checkType === 'aadhaar'}
                    onChange={(e) => {
                      setCheckType(e.target.value);
                      setInputValue('');
                    }}
                    className="ces-radio-input"
                  />
                  <label htmlFor="aadhaar" className="ces-radio-label">
                    Aadhaar Number
                  </label>
                </div>

                <div className="ces-radio-item">
                  <input
                    type="radio"
                    id="enrollmentId"
                    name="checkType"
                    value="enrollmentId"
                    checked={checkType === 'enrollmentId'}
                    onChange={(e) => {
                      setCheckType(e.target.value);
                      setInputValue('');
                    }}
                    className="ces-radio-input"
                  />
                  <label htmlFor="enrollmentId" className="ces-radio-label">
                    Enrollment ID
                  </label>
                </div>

                <div className="ces-radio-item">
                  <input
                    type="radio"
                    id="farmerId"
                    name="checkType"
                    value="farmerId"
                    checked={checkType === 'farmerId'}
                    onChange={(e) => {
                      setCheckType(e.target.value);
                      setInputValue('');
                    }}
                    className="ces-radio-input"
                  />
                  <label htmlFor="farmerId" className="ces-radio-label">
                    Farmer ID
                  </label>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="ces-section">
              <div className="ces-form-group">
                <label htmlFor="checkInput" className="ces-input-label">
                  {getInputLabel()}
                </label>
                <input
                  id="checkInput"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  className="ces-input-field"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ces-button-group">
              <button
                className={`ces-check-btn ${isInputFilled ? 'active' : 'disabled'}`}
                onClick={handleCheckStatus}
                disabled={!isInputFilled}
              >
                Check Status
              </button>
              <button
                className="ces-back-btn"
                onClick={handleBack}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckEnrollmentStatus;
