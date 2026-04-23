import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkEnrollmentStatus } from "../services/api";

const mobilePattern = /^\d{10}$/;

const farmerFields = [
  ["Mobile", "masked_mobile"],
  ["District", "district_name"],
  ["Block", "block_name"],
  ["Created At", "created_at"],
];

const pageClass =
  "flex min-h-full w-full flex-col bg-[#f0ece4] bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,rgba(2,75,55,0.10)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_92%_100%,rgba(134,179,116,0.14)_0%,transparent_55%)] font-lato";
const headerClass =
  "flex items-center justify-center border-b-[1.5px] border-[#eae6de] bg-white px-9 py-5 shadow-[0_2px_12px_rgba(2,50,36,0.06)] max-[768px]:px-5 max-[768px]:py-[18px]";
const titleClass =
  "mb-0.5 mt-0 text-center font-playfair text-[1.6rem] font-semibold tracking-[-0.2px] text-[#023628] max-[768px]:text-[1.3rem]";
const subTitleClass = "my-[3px] text-center font-lato text-base font-normal text-[#5c6b5e]";
const titleThirdClass = "mb-0 mt-[3px] text-center font-lato text-[1.1rem] font-bold text-[#024b37]";
const contentClass =
  "flex flex-1 items-start justify-center px-5 py-11 max-[768px]:px-4 max-[768px]:py-7";
const cardClass =
  "w-full max-w-[800px] animate-slide-in-soft rounded-[20px] border border-[#024b37]/[0.07] bg-white shadow-form-card";
const paddedCardClass =
  `${cardClass} px-12 py-11 max-[768px]:rounded-2xl max-[768px]:px-6 max-[768px]:py-8 max-[480px]:rounded-[14px] max-[480px]:px-[18px] max-[480px]:py-6`;
const cardHeaderClass =
  "mb-8 border-b-[1.5px] border-[#eae6de] pb-7 text-center";
const cardHeadingClass =
  "mb-2 mt-0 font-playfair text-[1.75rem] font-semibold tracking-[-0.2px] text-[#023628] max-[480px]:text-[1.4rem]";
const cardDescriptionClass = "m-0 text-[0.91rem] leading-relaxed text-[#5c6b5e]";
const formClass = "flex flex-col gap-5";
const formRowClass = "grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 max-[768px]:grid-cols-1";
const formGroupClass =
  "flex flex-col gap-[7px] [&>label]:text-[0.82rem] [&>label]:font-bold [&>label]:uppercase [&>label]:tracking-[0.04em] [&>label]:text-[#2a3b2e] [&>input]:appearance-none [&>input]:rounded-[10px] [&>input]:border-[1.5px] [&>input]:border-[#d8d2c6] [&>input]:bg-white [&>input]:px-3.5 [&>input]:py-[11px] [&>input]:font-lato [&>input]:text-[0.94rem] [&>input]:text-[#1a2b1e] [&>input]:outline-none [&>input]:transition [&>input]:duration-200 [&>input]:placeholder:text-[#a8a099] [&>input:hover]:border-[#a8c4b4] [&>input:focus]:border-[#024b37] [&>input:focus]:bg-[#f7fbf9] [&>input:focus]:shadow-[0_0_0_3px_rgba(2,75,55,0.10)]";
const errorMessageClass =
  "rounded-[10px] border-l-4 border-[#d14343] bg-[#fff3f3] px-4 py-3 text-[0.88rem] font-bold text-[#8b1c1c]";
const formActionsClass = "mt-2 flex justify-between gap-3 max-[768px]:flex-col";
const buttonBase =
  "flex-1 cursor-pointer rounded-xl px-6 py-[13px] font-lato text-[0.94rem] font-bold tracking-[0.03em] transition duration-200 max-[480px]:px-[18px] max-[480px]:py-3 max-[480px]:text-[0.88rem]";
const secondaryButtonClass =
  `${buttonBase} border-[1.5px] border-[#024b37] bg-white text-[#024b37] hover:-translate-y-px hover:border-[#035e47] hover:bg-[#f3f9f6] hover:shadow-[0_2px_8px_rgba(2,75,55,0.12)] active:translate-y-0 active:bg-[#eaf3ee] active:shadow-none`;
const primaryButtonClass =
  `${buttonBase} border-0 bg-[#024b37] text-white shadow-[0_2px_8px_rgba(2,75,55,0.22)] hover:-translate-y-px hover:bg-[#035e47] hover:shadow-[0_4px_16px_rgba(2,75,55,0.30)] active:translate-y-0 active:bg-[#023628] active:shadow-[0_1px_6px_rgba(2,75,55,0.20)]`;
const loadingCardClass = `${paddedCardClass} text-center`;
const spinnerClass =
  "mx-auto mb-[22px] h-[52px] w-[52px] animate-spin rounded-full border-[3px] border-[#eae6de] border-t-[#024b37]";
const resultsHeaderClass =
  "mb-8 flex items-center justify-between border-b-[1.5px] border-[#eae6de] pb-6 max-[768px]:flex-col max-[768px]:gap-3.5 max-[768px]:text-center";
const statusBadgeClass =
  "rounded-full border border-[#6dbf96] bg-[#edf7f2] px-[18px] py-[7px] text-[0.78rem] font-bold uppercase tracking-[0.07em] text-[#024b37]";
const farmerDetailsClass = "mb-8 grid gap-7 max-[768px]:gap-5";
const detailSectionClass =
  "[&>h3]:mb-4 [&>h3]:mt-0 [&>h3]:flex [&>h3]:items-center [&>h3]:gap-2.5 [&>h3]:font-playfair [&>h3]:text-[1.05rem] [&>h3]:font-semibold [&>h3]:text-[#024b37] [&>h3]:before:inline-block [&>h3]:before:h-4 [&>h3]:before:w-1 [&>h3]:before:shrink-0 [&>h3]:before:rounded-[3px] [&>h3]:before:bg-[#024b37] [&>h3]:before:content-['']";
const detailGridClass =
  "grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 max-[768px]:grid-cols-1";
const detailItemClass =
  "flex items-center justify-between rounded-[10px] border border-[#e8e3d8] border-l-[3.5px] border-l-[#024b37] bg-[#faf9f6] px-4 py-3";
const detailLabelClass = "text-[0.82rem] font-bold tracking-[0.02em] text-[#5c6b5e]";
const detailValueClass = "text-[0.91rem] font-bold text-[#023628]";
const resultsActionsClass =
  "mt-1 flex justify-center gap-3 border-t-[1.5px] border-[#eae6de] pt-2 max-[768px]:flex-col";

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function CheckEnrollment() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);

  const handleInputChange = (event) => {
    const numericValue = event.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(numericValue);
    setError("");
    setNoData(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mobilePattern.test(mobile.trim())) {
      setEnrollmentData(null);
      setNoData(false);
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    setError("");
    setNoData(false);
    setEnrollmentData(null);

    try {
      const response = await checkEnrollmentStatus(mobile.trim());
      setEnrollmentData(response.data);
    } catch (apiError) {
      const statusCode = apiError.response?.status;
      const detail = apiError.response?.data?.detail;

      if (statusCode === 404) {
        setNoData(true);
      } else {
        setError(detail || "Unable to fetch enrollment status. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setMobile("");
    setLoading(false);
    setError("");
    setNoData(false);
    setEnrollmentData(null);
  };

  return (
    <div className={pageClass}>
      <div className={headerClass}>
        <div className="flex items-center gap-5">
          <div>
            <h1 className={titleClass}>Government of Uttarakhand</h1>
            <h2 className={subTitleClass}>Farmer Enrollment Status</h2>
            <h3 className={titleThirdClass}>Check masked enrollment status using mobile number</h3>
          </div>
        </div>
      </div>

      <div className={contentClass}>
        <div className={paddedCardClass}>
          <div className={cardHeaderClass}>
            <h2 className={cardHeadingClass}>Check Enrollment Status</h2>
            <p className={cardDescriptionClass}>Enter the registered mobile number to view a limited enrollment status.</p>
          </div>

          <form onSubmit={handleSubmit} className={formClass}>
            <div className={formRowClass}>
              <div className={formGroupClass}>
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
              </div>
            </div>

            {error && <div className={errorMessageClass}>{error}</div>}

            <div className={formActionsClass}>
              <button
                type="button"
                onClick={() => navigate("/")}
                className={secondaryButtonClass}
              >
                Back to Home
              </button>
              <button type="submit" className={primaryButtonClass} disabled={loading}>
                {loading ? "Checking..." : "Check Status"}
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className={loadingCardClass}>
            <div className={spinnerClass}></div>
            <h3 className="mb-2 mt-0 font-playfair text-[1.3rem] font-semibold text-[#023628]">Checking Enrollment Status...</h3>
            <p className="m-0 text-[0.91rem] text-[#5c6b5e]">Please wait while we fetch the masked enrollment status.</p>
          </div>
        )}

        {noData && !loading && (
          <div className={paddedCardClass}>
            <div className={resultsHeaderClass}>
              <h2 className={cardHeadingClass}>No Enrollment Found</h2>
            </div>
            <p>No farmer record was found for this mobile number.</p>
            <div className={resultsActionsClass}>
              <button onClick={handleNewSearch} className={secondaryButtonClass}>
                New Search
              </button>
            </div>
          </div>
        )}

        {enrollmentData && !loading && (
          <div className={paddedCardClass}>
            <div className={resultsHeaderClass}>
              <h2 className={cardHeadingClass}>Enrollment Status</h2>
              <div className={statusBadgeClass}>Found</div>
            </div>

            <div className={farmerDetailsClass}>
              <div className={detailSectionClass}>
                <h3>Status Details</h3>
                <div className={detailGridClass}>
                  {farmerFields.map(([label, key]) => (
                    <div className={detailItemClass} key={key}>
                      <span className={detailLabelClass}>{label}:</span>
                      <span className={detailValueClass}>
                        {formatValue(enrollmentData.farmer?.[key])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="m-0 text-[0.88rem] leading-relaxed text-[#5c6b5e]">
                Sensitive farmer, bank, address, and land details are available only to authorized officers.
              </p>
            </div>

            <div className={resultsActionsClass}>
              <button onClick={handleNewSearch} className={secondaryButtonClass}>
                New Search
              </button>
              <button onClick={() => navigate("/")} className={primaryButtonClass}>
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckEnrollment;
