import React, { useState } from "react";

import ForgotPassword from "../components/ForgotPassword";
import { authClasses, authInputBase, authInputError } from "../components/authStyles";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const notifications = [
    "Department notifications and scheme alerts will appear here.",
    "Live updates section is reserved for scrolling announcements.",
    "You can later connect this panel to API-based notices or MIS alerts.",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
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
      const { loginUser, registerUser, setAuthSession } = await import("../services/api");

      if (isRegistering) {
        const userData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          full_name: formData.fullName.trim() || null,
          role_id: 4,
        };
        response = await registerUser(userData);
      } else {
        response = await loginUser(formData.username, formData.password);
      }

      const { access_token, user } = response.data;

      const normalizedUser = {
        ...user,
        role: user.role.toLowerCase(),
      };

      setAuthSession(access_token, normalizedUser);

      window.location.href = "/";
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Authentication failed. Please try again.";
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={authClasses.container}>
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
              <h2 className={authClasses.loginHeading}>
                {isRegistering ? "Farmer Account Registration" : "Official Login Portal"}
              </h2>
              <p className={authClasses.loginDescription}>
                Department of Agriculture & Horticulture, Government of Uttarakhand
              </p>
            </div>

            {authError && <div className={authClasses.errorBanner}>Warning: {authError}</div>}

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

              <button type="submit" className={authClasses.loginButton} disabled={loading}>
                {loading ? "Please wait..." : isRegistering ? "Create Farmer Account" : "Login"}
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
                {isRegistering ? "Already have an account? Login" : "Create farmer account"}
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
        <p>Government of Uttarakhand, Department of Agriculture & Horticulture | Millet Development Programme</p>
      </div>

      {showForgotPassword && <ForgotPassword onClose={() => setShowForgotPassword(false)} />}
    </div>
  );
}

export default Login;
