/**
 * Login page - Officer authentication and public account creation workflow.
 *
 * The page supports username/password login, a future OTP login UI, farmer-level
 * public account registration, and a placeholder password reset modal.
 */

import React, { useState } from "react";

import ForgotPassword from "../components/ForgotPassword";
import { authClasses, authInputBase, authInputError } from "../components/authStyles";
import {
  loginUser,
  registerUser,
  requestLoginOtp,
  setAuthSession,
  verifyLoginOtp,
} from "../services/api";
import { getPostLoginPath } from "../utils/authNavigation";

const LOGIN_METHODS = {
  PASSWORD: "password",
  OTP: "otp",
};

/**
 * Login - Render authentication form for officers and public farmer accounts.
 *
 * This component validates required fields, calls authentication APIs, stores
 * successful sessions, and routes users to role-appropriate landing pages.
 *
 * @component
 * @returns {React.ReactElement} Authentication page.
 */
function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    otpIdentifier: "",
    otpCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMethod, setLoginMethod] = useState(LOGIN_METHODS.PASSWORD);
  const [authError, setAuthError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpRequesting, setOtpRequesting] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const notifications = [
    "Department notifications and scheme alerts will appear here.",
    "Live updates section is reserved for scrolling announcements.",
    "You can later connect this panel to API-based notices or MIS alerts.",
  ];

  const clearFeedback = () => {
    // Clear all transient validation and API messages when the user changes mode.
    setErrors({});
    setAuthError(null);
    setAuthNotice(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "otpIdentifier") {
      // Changing the identifier invalidates any previously requested OTP state.
      setOtpRequested(false);
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validatePasswordForm = () => {
    // Password login and registration share username/password required checks.
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const validateOtpIdentifier = () => {
    const newErrors = {};

    if (!formData.otpIdentifier.trim()) {
      newErrors.otpIdentifier = "Username or mobile number is required";
    }

    return newErrors;
  };

  const validateOtpForm = () => {
    // OTP format is constrained to numeric codes while backend integration is pending.
    const newErrors = validateOtpIdentifier();

    if (!otpRequested) {
      newErrors.otpIdentifier = "Please request an OTP before logging in";
    }

    if (!formData.otpCode.trim()) {
      newErrors.otpCode = "OTP is required";
    } else if (!/^\d{4,8}$/.test(formData.otpCode.trim())) {
      newErrors.otpCode = "Enter a valid OTP";
    }

    return newErrors;
  };

  const validateForm = () => {
    if (isRegistering || loginMethod === LOGIN_METHODS.PASSWORD) {
      return validatePasswordForm();
    }

    return validateOtpForm();
  };

  const completeAuth = (response) => {
    // Normalize backend roles before storing the session and choosing a route.
    const { access_token, user } = response.data;
    const normalizedUser = {
      ...user,
      role: (user.role || "farmer").toLowerCase(),
    };

    setAuthSession(access_token, normalizedUser);
    window.location.href = getPostLoginPath(normalizedUser.role);
  };

  const handleRequestOtp = async () => {
    const validationErrors = validateOtpIdentifier();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setOtpRequesting(true);
    setAuthError(null);
    setAuthNotice(null);

    try {
      await requestLoginOtp(formData.otpIdentifier.trim());
      setOtpRequested(true);
      setAuthNotice("OTP sent. Enter the code to continue.");
    } catch (error) {
      setOtpRequested(true);
      setAuthNotice(
        error.message ||
          "OTP login UI is ready, but backend OTP sending is not configured yet.",
      );
    } finally {
      setOtpRequesting(false);
    }
  };

  const handleLoginMethodChange = (method) => {
    setLoginMethod(method);
    clearFeedback();
  };

  const handleRegistrationToggle = () => {
    setIsRegistering((current) => !current);
    setLoginMethod(LOGIN_METHODS.PASSWORD);
    setOtpRequested(false);
    clearFeedback();
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

      if (isRegistering) {
        // Backend defaults public registration to the low-privilege public role.
        const userData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          full_name: formData.fullName.trim() || null,
        };
        response = await registerUser(userData);
      } else if (loginMethod === LOGIN_METHODS.PASSWORD) {
        response = await loginUser(formData.username, formData.password);
      } else {
        response = await verifyLoginOtp(
          formData.otpIdentifier.trim(),
          formData.otpCode.trim(),
        );
      }

      completeAuth(response);
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Authentication failed. Please try again.";
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isOtpLogin = !isRegistering && loginMethod === LOGIN_METHODS.OTP;

  return (
    <div className={authClasses.container}>
      <div className={authClasses.heroContent}>
        {/* Responsive Tailwind grid: notification panel and login card stack below 1100px. */}
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
              <h2 className={authClasses.loginHeading}>
                {isRegistering ? "Create Account" : "Officers Login"}
              </h2>
              <p className={authClasses.loginDescription}>
                Department of Agriculture & Horticulture, Government of Uttarakhand
              </p>
            </div>

            {!isRegistering && (
              <div
                className={authClasses.methodSelector}
                role="tablist"
                aria-label="Login method"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMethod === LOGIN_METHODS.PASSWORD}
                  className={`${authClasses.methodTabBase} ${
                    loginMethod === LOGIN_METHODS.PASSWORD
                      ? authClasses.methodTabActive
                      : authClasses.methodTabInactive
                  }`}
                  onClick={() => handleLoginMethodChange(LOGIN_METHODS.PASSWORD)}
                >
                  Username + Password
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginMethod === LOGIN_METHODS.OTP}
                  className={`${authClasses.methodTabBase} ${
                    loginMethod === LOGIN_METHODS.OTP
                      ? authClasses.methodTabActive
                      : authClasses.methodTabInactive
                  }`}
                  onClick={() => handleLoginMethodChange(LOGIN_METHODS.OTP)}
                >
                  Login via OTP
                </button>
              </div>
            )}

            {authError && <div className={authClasses.errorBanner}>Warning: {authError}</div>}
            {authNotice && <div className={authClasses.infoBanner}>{authNotice}</div>}

            <form onSubmit={handleSubmit} className={authClasses.loginForm}>
              {isRegistering && (
                <>
                  <div className={authClasses.formGroup}>
                    <label className={authClasses.formLabel} htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`${authInputBase} ${errors.fullName ? authInputError : ""}`}
                    />
                    {errors.fullName && (
                      <span className={authClasses.errorText}>{errors.fullName}</span>
                    )}
                  </div>

                  <div className={authClasses.formGroup}>
                    <label className={authClasses.formLabel} htmlFor="email">
                      Email (Optional)
                    </label>
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
                </>
              )}

              {!isOtpLogin ? (
                <>
                  <div className={authClasses.formGroup}>
                    <label className={authClasses.formLabel} htmlFor="username">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                      className={`${authInputBase} ${errors.username ? authInputError : ""}`}
                    />
                    {errors.username && (
                      <span className={authClasses.errorText}>{errors.username}</span>
                    )}
                  </div>

                  <div className={authClasses.formGroup}>
                    <label className={authClasses.formLabel} htmlFor="password">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`${authInputBase} ${errors.password ? authInputError : ""}`}
                    />
                    {errors.password && (
                      <span className={authClasses.errorText}>{errors.password}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className={authClasses.otpActionRow}>
                    <div className={authClasses.formGroup}>
                      <label className={authClasses.formLabel} htmlFor="otpIdentifier">
                        Username or Mobile Number
                      </label>
                      <input
                        type="text"
                        id="otpIdentifier"
                        name="otpIdentifier"
                        value={formData.otpIdentifier}
                        onChange={handleInputChange}
                        placeholder="Enter username or mobile number"
                        className={`${authInputBase} ${
                          errors.otpIdentifier ? authInputError : ""
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      className={authClasses.otpSendButton}
                      onClick={handleRequestOtp}
                      disabled={otpRequesting || loading}
                    >
                      {otpRequesting ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                  {errors.otpIdentifier && (
                    <span className={authClasses.errorText}>{errors.otpIdentifier}</span>
                  )}

                  <div className={authClasses.formGroup}>
                    <label className={authClasses.formLabel} htmlFor="otpCode">
                      OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="otpCode"
                      name="otpCode"
                      value={formData.otpCode}
                      onChange={handleInputChange}
                      placeholder={otpRequested ? "Enter OTP" : "Request OTP first"}
                      disabled={!otpRequested}
                      className={`${authInputBase} disabled:cursor-not-allowed disabled:bg-[#f5f3f0] ${
                        errors.otpCode ? authInputError : ""
                      }`}
                    />
                    {errors.otpCode && (
                      <span className={authClasses.errorText}>{errors.otpCode}</span>
                    )}
                    <span className={authClasses.fieldHint}>
                      Use the OTP sent to the registered mobile number or email.
                    </span>
                  </div>
                </>
              )}

              <button type="submit" className={authClasses.loginButton} disabled={loading}>
                {loading
                  ? "Please wait..."
                  : isRegistering
                    ? "Create Account"
                    : isOtpLogin
                      ? "Login via OTP"
                      : "Login"}
              </button>
            </form>

            <div className={authClasses.loginFooter}>
              <button
                className={authClasses.registerToggle}
                onClick={handleRegistrationToggle}
                type="button"
              >
                {isRegistering ? "Already have an account? Login" : "Create account"}
              </button>

              {!isRegistering && loginMethod === LOGIN_METHODS.PASSWORD && (
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

      {showForgotPassword && <ForgotPassword onClose={() => setShowForgotPassword(false)} />}
    </div>
  );
}

export default Login;
