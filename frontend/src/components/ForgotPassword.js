import React, { useState } from 'react';
import '../styles/forgot-password.css';

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: email input, 2: success message
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Mock password reset - in real app, this would call an API
    setStep(2);
    setError('');
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔐 Reset Password</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <>
              <p className="modal-description">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <input
                    type="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={error ? 'error' : ''}
                  />
                  {error && <span className="error-text">{error}</span>}
                </div>

                <button type="submit" className="reset-btn">
                  📧 Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h3>Reset Link Sent!</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your email and follow the instructions to reset your password.
              </p>
              <p className="note">
                If you don't see the email in your inbox, please check your spam folder.
              </p>
              <button onClick={handleClose} className="close-success-btn">
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;