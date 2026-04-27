/**
 * CheckEnrollmentStatus page - Alternate enrollment status entry screen.
 *
 * This page currently provides a UI shell for Aadhaar, enrollment ID, or farmer
 * ID lookup. The backend integration remains pending and is represented by a
 * placeholder status notification.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const pageClass = "min-h-full w-full font-lato";
const backgroundClass =
  "flex min-h-full w-full flex-col bg-[#f0ece4] bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,rgba(2,75,55,0.10)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_92%_100%,rgba(134,179,116,0.14)_0%,transparent_55%)]";
const topBarClass = "h-[5px] w-full shrink-0 bg-[#024b37]";
const wrapperClass =
  "box-border flex flex-1 items-center justify-center px-5 py-12 max-[768px]:items-start max-[768px]:px-4 max-[768px]:pb-8 max-[768px]:pt-12";
const cardClass =
  "w-full max-w-[500px] animate-slide-in-soft rounded-[20px] border border-[#024b37]/[0.07] bg-white px-11 py-12 shadow-form-card max-[768px]:max-w-full max-[768px]:rounded-2xl max-[768px]:px-7 max-[768px]:py-8 max-[480px]:rounded-[14px] max-[480px]:px-[18px] max-[480px]:py-6";
const headerClass =
  "mb-9 border-b-[1.5px] border-[#eae6de] pb-7 text-center max-[480px]:mb-6 max-[480px]:pb-5";
const titleClass =
  "mb-2 mt-0 font-playfair text-[1.85rem] font-semibold leading-tight tracking-[-0.3px] text-[#023628] max-[768px]:text-[1.55rem] max-[480px]:text-[1.35rem]";
const subtitleClass =
  "m-0 text-[0.9rem] leading-relaxed text-[#5c6b5e] max-[768px]:text-[0.86rem] max-[480px]:text-[0.82rem]";
const sectionClass = "mb-7 max-[768px]:mb-[22px]";
const sectionTitleClass =
  "mb-[18px] mt-0 flex items-center gap-2.5 font-playfair text-base font-semibold text-[#024b37] before:inline-block before:h-4 before:w-1 before:shrink-0 before:rounded-[3px] before:bg-[#024b37] before:content-['']";
const radioGroupClass = "flex flex-col gap-3 max-[480px]:gap-2.5";
const radioItemClass =
  "relative flex cursor-pointer items-center rounded-[10px] border-[1.5px] border-[#e0dbd0] bg-white px-3.5 py-[11px] transition duration-150 hover:border-[#024b37] hover:bg-[#f3f9f6]";
const radioInputClass =
  "mr-3 h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-full border-2 border-[#d8d2c6] bg-white transition duration-200 hover:border-[#024b37] hover:shadow-[0_0_0_3px_rgba(2,75,55,0.10)] checked:border-[#024b37] checked:bg-[#024b37] checked:shadow-[inset_0_0_0_3px_white] max-[480px]:h-4 max-[480px]:w-4";
const radioLabelClass =
  "m-0 cursor-pointer select-none font-lato text-[0.9rem] font-bold text-[#2a3b2e] max-[480px]:text-[0.85rem]";
const formGroupClass = "flex flex-col gap-[7px]";
const inputLabelClass =
  "m-0 text-[0.82rem] font-bold uppercase tracking-[0.04em] text-[#2a3b2e]";
const inputClass =
  "box-border w-full appearance-none rounded-[10px] border-[1.5px] border-[#d8d2c6] bg-white px-3.5 py-[11px] font-lato text-[0.94rem] text-[#1a2b1e] outline-none transition duration-200 placeholder:text-[#a8a099] hover:border-[#a8c4b4] focus:border-[#024b37] focus:bg-[#f7fbf9] focus:shadow-[0_0_0_3px_rgba(2,75,55,0.10)] max-[480px]:px-3 max-[480px]:py-2.5 max-[480px]:text-[0.88rem]";
const buttonGroupClass =
  "mt-9 flex flex-wrap justify-center gap-3 max-[768px]:mt-9 max-[768px]:flex-col max-[768px]:gap-2.5 max-[480px]:mt-7";
const buttonBase =
  "min-w-[150px] cursor-pointer rounded-xl px-7 py-[13px] font-lato text-[0.94rem] font-bold tracking-[0.03em] transition duration-200 max-[768px]:w-full max-[768px]:min-w-[130px] max-[768px]:px-[22px] max-[768px]:py-3 max-[768px]:text-[0.9rem] max-[480px]:px-4 max-[480px]:py-[11px] max-[480px]:text-[0.88rem]";
const checkButtonClass = (isInputFilled) =>
  isInputFilled
    ? `${buttonBase} border-0 bg-[#024b37] text-white shadow-[0_2px_8px_rgba(2,75,55,0.22)] hover:-translate-y-px hover:bg-[#035e47] hover:shadow-[0_4px_16px_rgba(2,75,55,0.30)] active:translate-y-0 active:bg-[#023628] active:shadow-[0_1px_6px_rgba(2,75,55,0.20)]`
    : `${buttonBase} border-0 bg-[#a8c4b4] text-white shadow-none`;
const backButtonClass =
  `${buttonBase} border-[1.5px] border-[#024b37] bg-white text-[#024b37] hover:-translate-y-px hover:border-[#035e47] hover:bg-[#f3f9f6] hover:shadow-[0_2px_8px_rgba(2,75,55,0.12)] active:translate-y-0 active:bg-[#eaf3ee] active:shadow-none`;

/**
 * CheckEnrollmentStatus - Render the alternate lookup selection UI.
 *
 * @component
 * @returns {React.ReactElement} Enrollment status lookup form.
 */
function CheckEnrollmentStatus() {
  const [checkType, setCheckType] = useState('aadhaar');
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const getInputLabel = () => {
    // Label changes with the selected lookup identifier.
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
    // Placeholder mirrors the selected identifier to reduce data-entry errors.
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
      // Placeholder until the backend supports Aadhaar/enrollment/farmer ID lookup.
      alert("Status lookup request received.");
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const isInputFilled = inputValue.trim().length > 0;

  return (
    <div className={pageClass}>
      <div className={backgroundClass}>
        {/* Decorative Tailwind top bar anchors the public lookup screen. */}
        <div className={topBarClass}></div>

        {/* Main content wrapper centers the card and shifts upward on small screens. */}
        <div className={wrapperClass}>
          <div className={cardClass}>
            {/* Header */}
            <div className={headerClass}>
              <h1 className={titleClass}>Check Enrollment Status</h1>
              <p className={subtitleClass}>
                Check your enrollment status using any of the below options
              </p>
            </div>

            {/* Check Status Against Section */}
            <div className={sectionClass}>
              <h2 className={sectionTitleClass}>Check Status Against</h2>

              {/* Radio Buttons */}
              <div className={radioGroupClass}>
                <div className={radioItemClass}>
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
                    className={radioInputClass}
                  />
                  <label htmlFor="aadhaar" className={radioLabelClass}>
                    Aadhaar Number
                  </label>
                </div>

                <div className={radioItemClass}>
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
                    className={radioInputClass}
                  />
                  <label htmlFor="enrollmentId" className={radioLabelClass}>
                    Enrollment ID
                  </label>
                </div>

                <div className={radioItemClass}>
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
                    className={radioInputClass}
                  />
                  <label htmlFor="farmerId" className={radioLabelClass}>
                    Farmer ID
                  </label>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className={sectionClass}>
              <div className={formGroupClass}>
                <label htmlFor="checkInput" className={inputLabelClass}>
                  {getInputLabel()}
                </label>
                <input
                  id="checkInput"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={buttonGroupClass}>
              <button
                className={checkButtonClass(isInputFilled)}
                onClick={handleCheckStatus}
                disabled={!isInputFilled}
              >
                Check Status
              </button>
              <button
                className={backButtonClass}
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
