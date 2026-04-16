import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from '../components/ForgotPassword';
import '../styles/login.css';

function Login() {
  const [officialRole, setOfficialRole] = useState('admin');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    // captcha: '', // Commented out for later enablement
    email: '',
    fullName: '',
    district: ''
  });
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSchemeDropdown, setShowSchemeDropdown] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const districts = [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
    'Haridwar', 'Nainital', 'Pauri', 'Pithoragarh', 'Rudraprayag', 'Tehri', 'Uttarkashi'
  ];

  const blocks = {
    'Nainital': ['Nainital', 'Bhimtal', 'Haldwani', 'Ramnagar'],
    'Almora': ['Almora', 'Chaukhutia', 'Hawalbagh', 'Ranikhet'],
    'Dehradun': ['Dehradun', 'Vikasnagar', 'Doiwala', 'Raipur'],
    'Haridwar': ['Haridwar', 'Khanpur', 'Lakhanpur', 'Bahadarabad'],
    // Add more blocks as needed
  };

  const schemes = [
    {
      name: 'Uttarakhand Millet Mission',
      pdfUrl: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2023/apr/doc2023426187201.pdf'
    },
    {
      name: 'National Food Security Mission (NFSM) – Nutri Cereals',
      pdfUrl: 'https://nfsm.gov.in/Guidelines/NFSM12102018.pdf'
    },
    {
      name: 'Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)',
      pdfUrl: 'https://cdnbbsr.s3waas.gov.in/s30fe473396242072e84af286632d3f0ff/uploads/2025/02/202502191483775042.pdf'
    },
    {
      name: 'Pradhan Mantri Annadata Aay Sanrakshan Abhiyan (PM-AASHA)',
      pdfUrl: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1657221&reg=3&lang=2'
    },
    {
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      pdfUrl: 'https://pmfby.gov.in/pdf/Revised_Operational_Guidelines.pdf'
    }
  ];

  const handleSchemeOpen = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
    setShowSchemeDropdown(false);
  };

  const milletImages = [
    {
      label: 'Barnyard Millet (Jhangora)',
      src: '/7.jpg'
    },
    {
      label: 'Amaranth (Chaulai)',
      src: '/1.png'
    },
    {
      label: 'Foxtail Millet (Kauni)',
      src: '/5.jpg'
    },
    {
      label: 'Proso Millet (Cheena)',
      src: '/8.jpg'
    },
    {
      label: 'Finger Millet (Ragi)',
      src: '/4.jpg'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    // Captcha validation commented out for later enablement
    // if (!formData.captcha.trim()) {
    //   newErrors.captcha = 'Please enter the captcha';
    // }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      let response;
      const { loginUser, registerUser } = await import('../services/api');

      if (isRegistering) {
        // Register new user (only for officers)
        const roleMap = { 'admin': 1, 'district_officer': 2, 'block_officer': 3 };
        const userData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role_id: roleMap[officialRole],
          district: formData.district || null
        };
        response = await registerUser(userData);
      } else {
        // Login
        response = await loginUser(formData.username, formData.password);
      }

      const { access_token, user } = response.data;
      
      // Store token and user info (normalize role to lowercase)
      const normalizedUser = {
        ...user,
        role: user.role.toLowerCase()
      };
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
      localStorage.setItem('userRole', normalizedUser.role);
      
      // Reload the page to let AuthContext reinitialize with new auth
      // This will allow the context to properly set up before navigation happens
      window.location.href = '/';
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Authentication failed. Please try again.';
      setAuthError(errorMsg);
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Captcha generation commented out for later enablement
  // const generateCaptcha = () => {
  //   return Math.random().toString(36).substring(2, 8).toUpperCase();
  // };
  //
  // const [captchaText] = useState(generateCaptcha());

  return (
    <div className="login-container">
      <header className="top-header" data-aos="fade-down">
        <div className="header-left">
          <img src="/logo3.png" alt="Logo 3" className="header-logo logo3-login" />
          <div className="header-logo-separator">|</div>
          <img src="/logo2.png" alt="Logo 2" className="header-logo" />
          <div className="header-logo-separator">|</div>
          <img src="/logo1.png" alt="Logo 1" className="header-logo" />
        </div>

        <div className="header-center">
          <div className="header-title">
            <span>Department of Agriculture & Horticulture, Uttarakhand</span>
            <h1>State Millet Monitoring & Management System</h1>
          </div>
        </div>

        <div className="header-right">
          <button className="header-btn" onClick={() => navigate('/procurement')}>Dashboard</button>
          <div className="schemes-dropdown-container">
            <button 
              className="header-btn"
              onClick={() => setShowSchemeDropdown(!showSchemeDropdown)}
            >
              Schemes
            </button>
            {showSchemeDropdown && (
              <div className="schemes-dropdown-menu">
                {schemes.map((scheme, index) => (
                  <div key={index} className="scheme-item">
                    <span>{scheme.name}</span>
                    <button 
                      className="pdf-btn"
                      onClick={() => handleSchemeOpen(scheme.pdfUrl)}
                      title="Open PDF"
                    >
                      📄 View PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="hero-content">
        <div className="page-cards">
          <div className="info-card" data-aos="fade-right" data-aos-delay="150">
            <p>
              This platform provides real-time monitoring of millet production, farmer registration, district performance, and government schemes to strengthen millet-based agriculture in Uttarakhand.
            </p>
            <div className="millet-images">
              {milletImages.map((item) => (
                <div key={item.label} className="millet-image-card">
                  <img src={item.src} alt={item.label} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="login-card" data-aos="fade-left" data-aos-delay="200">
          <div className="login-header-text">
            <h2>Official Login Portal</h2>
            <p>Department of Agriculture & Horticulture, Government of Uttarakhand</p>
            <button
              type="button"
              className="register-toggle-link"
              onClick={() => navigate('/register-farmer')}
            >
              Register Farmer
            </button>
          </div>

          <div className="role-selector">
            <label>Select Role:</label>
            <select 
              value={officialRole} 
              onChange={(e) => setOfficialRole(e.target.value)}
              className="role-select"
            >
              <option value="admin">Admin</option>
              <option value="district_officer">District Officer</option>
              <option value="block_officer">Block Officer</option>
            </select>
          </div>

          {authError && (
            <div className="error-banner">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {isRegistering && (
              <>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email (optional)"
                  />
                </div>

                {(officialRole === 'district_officer' || officialRole === 'block_officer') && (
                  <div className="form-group">
                    <label htmlFor="district">District</label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className={errors.district ? 'error' : ''}
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.district && <span className="error-text">{errors.district}</span>}
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Captcha section commented out for later enablement
            {!isRegistering && (
              <div className="form-group">
                <label htmlFor="captcha">Captcha</label>
                <div className="captcha-section">
                  <div className="captcha-display">{captchaText}</div>
                  <input
                    type="text"
                    id="captcha"
                    name="captcha"
                    value={formData.captcha}
                    onChange={handleInputChange}
                    placeholder="Enter captcha"
                    className={errors.captcha ? 'error' : ''}
                  />
                </div>
                {errors.captcha && <span className="error-text">{errors.captcha}</span>}
              </div>
            )}
            */}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
            </button>
          </form>

          <div className="login-footer">
            <button
              className="register-toggle-link"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrors({});
                setAuthError(null);
              }}
              type="button"
            >
              {isRegistering ? 'Already have an account? Login' : 'Create new account'}
            </button>
            {!isRegistering && (
              <>
                <button
                  className="forgot-link"
                  onClick={() => setShowForgotPassword(true)}
                  type="button"
                >
                  Forgot Password?
                </button>
                <button
                  className="enrollment-link"
                  onClick={() => navigate('/enrollment-status')}
                  type="button"
                >
                  Check Enrollment Status
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="login-footer-global">
      <p>© Government of Uttarakhand, Department of Agriculture & Horticulture | Millet Development Programme</p>
    </div>

    {showForgotPassword && (
      <ForgotPassword onClose={() => setShowForgotPassword(false)} />
    )}
  </div>
  );
}

export default Login;
