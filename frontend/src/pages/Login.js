import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from '../components/ForgotPassword';
import { authClasses, authInputBase, authInputError } from '../components/authStyles';

function Login() {
  const [officialRole, setOfficialRole] = useState('admin');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    // captcha: '', // Commented out for later enablement
    email: '',
    fullName: '',
    district: '',
    block: ''
  });
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSchemeDropdown, setShowSchemeDropdown] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const districts = [
    'Almora',
    'Bageshwar',
    'Chamoli',
    'Champawat',
    'Dehradun',
    'Haridwar',
    'Nainital',
    'Pauri Garhwal',
    'Pithoragarh',
    'Rudraprayag',
    'Tehri Garhwal',
    'Udham Singh Nagar',
    'Uttarkashi'
  ];

  const blocks = {
    'Almora': [
      'Bhaisiya Chhana', 'Chaukhutia', 'Dhauladevi', 'Hawalbagh',
      'Lamgara', 'Salt', 'Sult', 'Takula', 'Tarikhet'
    ],
    'Bageshwar': [
      'Bageshwar', 'Garur', 'Kapkot'
    ],
    'Chamoli': [
      'Dasholi', 'Dewal', 'Gairsain', 'Ghat',
      'Joshimath', 'Karnaprayag', 'Narayanbagar', 'Pokhari', 'Tharali'
    ],
    'Champawat': [
      'Barakot', 'Champawat', 'Lohaghat', 'Pati'
    ],
    'Dehradun': [
      'Chakrata', 'Doiwala', 'Kalsi', 'Raipur', 'Sahaspur', 'Vikasnagar'
    ],
    'Haridwar': [
      'Bahadrabad', 'Bhagwanpur', 'Khanpur', 'Laksar', 'Narsan', 'Roorkee'
    ],
    'Nainital': [
      'Betalghat', 'Bhimtal', 'Dhari', 'Haldwani',
      'Kotabagh', 'Okhalkanda', 'Ramnagar'
    ],
    'Pauri Garhwal': [
      'Bironkhal', 'Dwarikhal', 'Ekeshwar', 'Jaiharikhal',
      'Kaljikhal', 'Khirsu', 'Kot', 'Nainidanda',
      'Pabo', 'Pauri', 'Pokhra', 'Rikhnikhal',
      'Thalisain', 'Yamkeshwar'
    ],
    'Pithoragarh': [
      'Berinag', 'Dharchula', 'Didihat', 'Gangolihat',
      'Kanalichina', 'Munsiyari', 'Pithoragarh'
    ],
    'Rudraprayag': [
      'Augustmuni', 'Jakholi', 'Ukhimath'
    ],
    'Tehri Garhwal': [
      'Bhilangna', 'Chamba', 'Devprayag', 'Jakhnidhar',
      'Jaunpur', 'Kirtinagar', 'Narendranagar', 'Pratapnagar', 'Thauldhar'
    ],
    'Udham Singh Nagar': [
      'Bajpur', 'Gadarpur', 'Jaspur', 'Kashipur',
      'Khatima', 'Rudrapur', 'Sitarganj'
    ],
    'Uttarkashi': [
      'Bhatwari', 'Chinyalisaur', 'Dunda',
      'Mori', 'Naugaon', 'Purola'
    ]
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

  const notifications = [
    'Department notifications and scheme alerts will appear here.',
    'Live updates section is reserved for scrolling announcements.',
    'You can later connect this panel to API-based notices or MIS alerts.'
  ];

  const handleSchemeOpen = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
    setShowSchemeDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'district' ? { block: '' } : {})
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'district' && errors.block) {
      setErrors(prev => ({
        ...prev,
        block: ''
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

    if (isRegistering && (officialRole === 'district_officer' || officialRole === 'block_officer')) {
      if (!formData.district.trim()) {
        newErrors.district = 'District is required';
      }
    }

    if (isRegistering && officialRole === 'block_officer') {
      if (!formData.block.trim()) {
        newErrors.block = 'Block is required';
      }
    }

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
        const roleMap = { admin: 1, district_officer: 2, block_officer: 3 };
        const userData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role_id: roleMap[officialRole],
          district: formData.district || null,
          block: officialRole === 'block_officer' ? formData.block || null : null
        };
        response = await registerUser(userData);
      } else {
        response = await loginUser(formData.username, formData.password);
      }

      const { access_token, user } = response.data;

      const normalizedUser = {
        ...user,
        role: user.role.toLowerCase()
      };

      localStorage.setItem('authToken', access_token);
      localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
      localStorage.setItem('userRole', normalizedUser.role);

      window.location.href = '/';
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Authentication failed. Please try again.';
      setAuthError(errorMsg);
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={authClasses.container}>
      <header className={authClasses.topHeader} data-aos="fade-down">
        <div className={authClasses.headerLeft}>
          <img
            src="/logo3.png"
            alt="Logo 3"
            className={`${authClasses.headerLogo} ${authClasses.headerLogoBlend}`}
          />
          <div className={authClasses.headerSeparator}>|</div>
          <img src="/logo2.png" alt="Logo 2" className={authClasses.headerLogo} />
          <div className={authClasses.headerSeparator}>|</div>
          <img src="/logo1.png" alt="Logo 1" className={authClasses.headerLogo} />
        </div>

        <div className={authClasses.headerCenter}>
          <div className={authClasses.headerTitle}>
            <span className={authClasses.headerEyebrow}>Department of Agriculture & Horticulture, Uttarakhand</span>
            <h1 className={authClasses.headerH1}>State Millet Monitoring & Management System</h1>
          </div>
        </div>

        <div className={authClasses.headerRight}>
          <button className={authClasses.headerButton} onClick={() => navigate('/procurement')}>
            Dashboard
          </button>

          <button className={authClasses.headerButton} onClick={() => navigate('/register-farmer')}>
            Register Farmer
          </button>

          <button className={authClasses.headerButton} onClick={() => navigate('/enrollment-status')}>
            Enrollment Status
          </button>

          <button className={authClasses.headerButton} onClick={() => navigate('/about-programme')}>
            About Programme
          </button>

          <div className={authClasses.dropdownContainer}>
            <button
              className={authClasses.headerButton}
              onClick={() => setShowSchemeDropdown(!showSchemeDropdown)}
            >
              Schemes
            </button>
            {showSchemeDropdown && (
              <div className={authClasses.dropdownMenu}>
                {schemes.map((scheme, index) => (
                  <div key={index} className={authClasses.schemeItem}>
                    <span className={authClasses.schemeName}>{scheme.name}</span>
                    <button
                      className={authClasses.pdfButton}
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

      <div className={authClasses.heroContent}>
        <div className={authClasses.pageCards}>
          <div className={authClasses.leftPanel} data-aos="fade-right" data-aos-delay="100">
            <div className={authClasses.notificationBox}>
              <div className={authClasses.notificationHeader}>
                <h3 className={authClasses.notificationTitle}>Notifications</h3>
                <span className={authClasses.liveBadge}>Live</span>
              </div>

              <div className={authClasses.notificationMarquee}>
                <div className={authClasses.notificationTrack}>
                  {[...notifications, ...notifications].map((item, index) => (
                    <div key={index} className={authClasses.notificationItem}>
                      <span className={authClasses.notificationDot} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={authClasses.loginCard} data-aos="fade-up" data-aos-delay="150">
            <div className={authClasses.loginHeaderText}>
              <h2 className={authClasses.loginHeading}>Official Login Portal</h2>
              <p className={authClasses.loginDescription}>Department of Agriculture & Horticulture, Government of Uttarakhand</p>
            </div>

            <div className={authClasses.roleSelector}>
              <label className={authClasses.roleLabel}>Select Role:</label>
              <select
                value={officialRole}
                onChange={(e) => setOfficialRole(e.target.value)}
                className={authInputBase}
              >
                <option value="admin">Admin</option>
                <option value="district_officer">District Officer</option>
                <option value="block_officer">Block Officer</option>
              </select>
            </div>

            {authError && (
              <div className={authClasses.errorBanner}>
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className={authClasses.loginForm}>
              {isRegistering && (
                <>
                  <div className={authClasses.formGroup}>
                    <label className={authClasses.formLabel} htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`${authInputBase} ${errors.fullName ? authInputError : ''}`}
                    />
                    {errors.fullName && <span className={authClasses.errorText}>{errors.fullName}</span>}
                  </div>

                  <div className={authClasses.formGroup}>
                    <label className={authClasses.formLabel} htmlFor="email">Email (Optional)</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email (optional)"
                      className={authInputBase}
                    />
                  </div>

                  {(officialRole === 'district_officer' || officialRole === 'block_officer') && (
                    <div className={authClasses.formGroup}>
                      <label className={authClasses.formLabel} htmlFor="district">District</label>
                      <select
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={`${authInputBase} ${errors.district ? authInputError : ''}`}
                      >
                        <option value="">Select District</option>
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {errors.district && <span className={authClasses.errorText}>{errors.district}</span>}
                    </div>
                  )}

                  {officialRole === 'block_officer' && formData.district && (
                    <div className={authClasses.formGroup}>
                      <label className={authClasses.formLabel} htmlFor="block">Block</label>
                      <select
                        id="block"
                        name="block"
                        value={formData.block}
                        onChange={handleInputChange}
                        className={`${authInputBase} ${errors.block ? authInputError : ''}`}
                      >
                        <option value="">Select Block</option>
                        {(blocks[formData.district] || []).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                      {errors.block && <span className={authClasses.errorText}>{errors.block}</span>}
                    </div>
                  )}
                </>
              )}

              <div className={authClasses.formGroup}>
                <label className={authClasses.formLabel} htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className={`${authInputBase} ${errors.username ? authInputError : ''}`}
                />
                {errors.username && <span className={authClasses.errorText}>{errors.username}</span>}
              </div>

              <div className={authClasses.formGroup}>
                <label className={authClasses.formLabel} htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`${authInputBase} ${errors.password ? authInputError : ''}`}
                />
                {errors.password && <span className={authClasses.errorText}>{errors.password}</span>}
              </div>

              <button type="submit" className={authClasses.loginButton} disabled={loading}>
                {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
              </button>
            </form>

            <div className={authClasses.loginFooter}>
              <button
                className={authClasses.registerToggle}
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
                <button
                  className={authClasses.forgotLink}
                  onClick={() => setShowForgotPassword(true)}
                  type="button"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={authClasses.globalFooter}>
        <p>© Government of Uttarakhand, Department of Agriculture & Horticulture | Millet Development Programme</p>
      </div>

      {showForgotPassword && (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}

export default Login;
