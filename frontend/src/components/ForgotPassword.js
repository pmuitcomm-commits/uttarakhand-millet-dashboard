/**
 * ForgotPassword component module - Displays the reset-password modal.
 *
 * The current implementation keeps the reset UI visible while the reset
 * workflow is pending backend integration.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { modalClasses } from './authStyles';

/**
 * ForgotPassword - Modal workflow for password reset requests.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Function} props.onClose - Callback invoked when the modal closes.
 * @returns {React.ReactElement} Password reset modal.
 */
function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    window.alert('Coming Soon');
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div className={modalClasses.overlay} onClick={handleClose}>
      <div className={modalClasses.content} onClick={(e) => e.stopPropagation()}>
        <div className={modalClasses.header}>
          <h2 className={modalClasses.title}>Reset Password</h2>
          <button className={modalClasses.closeButton} onClick={handleClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={modalClasses.body}>
          <p className={modalClasses.description}>
            Enter your registered email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className={modalClasses.formGroup}>
              <label className={modalClasses.label} htmlFor="reset-email">Email Address</label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`${modalClasses.input} ${error ? modalClasses.inputError : ''}`}
              />
              {error && <span className={modalClasses.errorText}>{error}</span>}
            </div>

            <button type="submit" className={modalClasses.resetButton}>
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
