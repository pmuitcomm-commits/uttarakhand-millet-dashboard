import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/enrollment.css';

function CheckEnrollment() {
  const [formData, setFormData] = useState({
    farmerId: '',
    aadhaar: '',
    mobile: ''
  });
  const [step, setStep] = useState(1); // 1: form, 2: loading, 3: results
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.farmerId.trim() && !formData.aadhaar.trim() && !formData.mobile.trim()) {
      setError('Please enter at least one search criteria (Farmer ID, Aadhaar, or Mobile)');
      return false;
    }

    if (formData.aadhaar && formData.aadhaar.length !== 12) {
      setError('Aadhaar number must be 12 digits');
      return false;
    }

    if (formData.mobile && formData.mobile.length !== 10) {
      setError('Mobile number must be 10 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStep(2); // Loading

    // Mock API call - in real app, this would fetch from backend
    setTimeout(() => {
      // Mock enrollment data
      const mockData = {
        farmerId: formData.farmerId || 'UK2024001234',
        name: 'Rajesh Kumar',
        district: 'Udham Singh Nagar',
        status: 'Enrolled',
        enrollmentDate: '2024-01-15',
        milletTypes: ['Finger Millet', 'Foxtail Millet'],
        totalArea: '5.5 hectares',
        contact: formData.mobile || '9876543210'
      };

      setEnrollmentData(mockData);
      setStep(3);
    }, 2000);
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  const handleNewSearch = () => {
    setFormData({ farmerId: '', aadhaar: '', mobile: '' });
    setStep(1);
    setEnrollmentData(null);
    setError('');
  };

  return (
    <div className="enrollment-container">
      <div className="enrollment-header">
        <div className="logo-section">
          <div className="gov-logo-placeholder">
            <span className="gov-emblem">🏛️</span>
          </div>
          <div className="title-section">
            <h1>उत्तराखंड सरकार</h1>
            <h2>Government of Uttarakhand</h2>
            <h3> Farmer Enrollment Status</h3>
          </div>
        </div>
      </div>

      <div className="enrollment-content">
        {step === 1 && (
          <div className="enrollment-card" data-aos="fade-up">
            <div className="card-header">
              <h2> Check Enrollment Status</h2>
              <p>Enter any of the following details to check your farmer enrollment status</p>
            </div>

            <form onSubmit={handleSubmit} className="enrollment-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="farmerId">Farmer ID (Optional)</label>
                  <input
                    type="text"
                    id="farmerId"
                    name="farmerId"
                    value={formData.farmerId}
                    onChange={handleInputChange}
                    placeholder="e.g., UK2024001234"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="aadhaar">Aadhaar Number (Optional)</label>
                  <input
                    type="text"
                    id="aadhaar"
                    name="aadhaar"
                    value={formData.aadhaar}
                    onChange={handleInputChange}
                    placeholder="12-digit Aadhaar number"
                    maxLength="12"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number (Optional)</label>
                  <input
                    type="text"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="button" onClick={handleBackToLogin} className="back-btn">
                  ← Back to Login
                </button>
                <button type="submit" className="check-btn">
                   Check Status
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="loading-card" data-aos="fade-up">
            <div className="loading-spinner"></div>
            <h3>Checking Enrollment Status...</h3>
            <p>Please wait while we verify your details</p>
          </div>
        )}

        {step === 3 && enrollmentData && (
          <div className="results-card" data-aos="fade-up">
            <div className="results-header">
              <h2> Enrollment Found</h2>
              <div className="status-badge enrolled">
                {enrollmentData.status}
              </div>
            </div>

            <div className="farmer-details">
              <div className="detail-section">
                <h3> Farmer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Farmer ID:</span>
                    <span className="value">{enrollmentData.farmerId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{enrollmentData.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">District:</span>
                    <span className="value">{enrollmentData.district}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Contact:</span>
                    <span className="value">{enrollmentData.contact}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3> Agriculture Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Enrollment Date:</span>
                    <span className="value">{enrollmentData.enrollmentDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Area:</span>
                    <span className="value">{enrollmentData.totalArea}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Millet Types:</span>
                    <span className="value">{enrollmentData.milletTypes.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="results-actions">
              <button onClick={handleNewSearch} className="new-search-btn">
                 New Search
              </button>
              <button onClick={handleBackToLogin} className="login-btn">
                 Go to Login
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="enrollment-footer">
        <p>© 2024 Government of Uttarakhand | Department of Agriculture</p>
      </div>
    </div>
  );
}

export default CheckEnrollment;