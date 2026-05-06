/**
 * Login page - Officer authentication workflow.
 *
 * The page supports username/password login, a future OTP login UI, and a
 * placeholder password reset modal.
 */

import React, { useState } from "react";

import ForgotPassword from "../components/ForgotPassword";
import { authClasses, authInputBase, authInputError } from "../components/authStyles";
import {
  loginUser,
  setAuthSession,
} from "../services/api";
import { getPostLoginPath } from "../utils/authNavigation";
import {
  getAuthErrorMessage,
  initialLoginFormData,
  loginNotifications,
  LOGIN_METHODS,
  normalizeAuthUser,
  validateLoginForm,
} from "./loginFormHelpers";

const showComingSoon = () => {
  window.alert("Coming Soon");
};

/**
 * Login - Render authentication form for manually managed officer accounts.
 *
 * This component validates required fields, calls authentication APIs, stores
 * successful sessions, and routes users to role-appropriate landing pages.
 *
 * @component
 * @returns {React.ReactElement} Authentication page.
 */
function Login() {
  const [formData, setFormData] = useState(initialLoginFormData);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState(LOGIN_METHODS.PASSWORD);
  const [authError, setAuthError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

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

  const completeAuth = (response) => {
    const normalizedUser = normalizeAuthUser(response.data.user);
    setAuthSession(normalizedUser);
    window.location.href = getPostLoginPath(normalizedUser.role);
  };

  const handleRequestOtp = async () => {
    showComingSoon();
  };

  const handleLoginMethodChange = (method) => {
    if (method === LOGIN_METHODS.OTP) {
      showComingSoon();
    }
    setLoginMethod(method);
    clearFeedback();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginMethod === LOGIN_METHODS.OTP) {
      showComingSoon();
      return;
    }

    const validationErrors = validateLoginForm({
      formData,
      loginMethod,
      otpRequested,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      let response;

      if (loginMethod === LOGIN_METHODS.PASSWORD) {
        response = await loginUser(formData.username, formData.password);
      }

      completeAuth(response);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const isOtpLogin = loginMethod === LOGIN_METHODS.OTP;

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
                  {[...loginNotifications, ...loginNotifications].map((item, index) => (
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
                Officers Login
              </h2>
              <p className={authClasses.loginDescription}>
                Department of Agriculture & Horticulture, Government of Uttarakhand
              </p>
            </div>

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
                Login with Password
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

            {authError && <div className={authClasses.errorBanner}>Warning: {authError}</div>}
            {authNotice && <div className={authClasses.infoBanner}>{authNotice}</div>}

            <form onSubmit={handleSubmit} className={authClasses.loginForm}>
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
                      disabled={loading}
                    >
                      Send OTP
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
                  : isOtpLogin
                    ? "Login via OTP"
                    : "Login"}
              </button>
            </form>

            <div className={authClasses.loginFooter}>
              {loginMethod === LOGIN_METHODS.PASSWORD && (
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
