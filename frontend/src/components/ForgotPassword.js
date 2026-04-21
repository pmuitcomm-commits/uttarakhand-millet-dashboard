import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { modalClasses } from './authStyles';

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
    <div className={modalClasses.overlay} onClick={handleClose}>
      <div className={modalClasses.content} onClick={(e) => e.stopPropagation()}>
        <div className={modalClasses.header}>
          <h2 className={modalClasses.title}>Reset Password</h2>
          <button className={modalClasses.closeButton} onClick={handleClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={modalClasses.body}>
          {step === 1 ? (
            <>
              <p className={modalClasses.description}>
                Enter your registered email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
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
            </>
          ) : (
            <div className={modalClasses.success}>
              <CheckCircle2 className={`${modalClasses.successIcon} mx-auto h-12 w-12 text-green-600`} />
              <h3 className={modalClasses.successTitle}>Reset Link Sent!</h3>
              <p className={modalClasses.successText}>
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your email and follow the instructions to reset your password.
              </p>
              <p className={modalClasses.note}>
                If you don't see the email in your inbox, please check your spam folder.
              </p>
              <button onClick={handleClose} className={modalClasses.closeSuccess}>
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
