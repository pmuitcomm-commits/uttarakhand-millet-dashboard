import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerFarmer } from "../services/api";

const districts = [
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nainital",
  "Pauri Garhwal",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri Garhwal",
  "Udham Singh Nagar",
  "Uttarkashi",
];

const blocksByDistrict = {
  Nainital: ["Nainital", "Bhimtal", "Haldwani", "Ramnagar"],
  Almora: ["Almora", "Chaukhutia", "Hawalbagh", "Ranikhet"],
  Dehradun: ["Dehradun", "Vikasnagar", "Doiwala", "Raipur"],
  Haridwar: ["Haridwar", "Khanpur", "Lakhanpur", "Bahadarabad"],
  Chamoli: ["Gopeshwar", "Joshimath", "Chamoli", "Tharali"],
  Champawat: ["Champawat", "Lohaghat", "Pati", "Pancheshwar"],
  "Pauri Garhwal": ["Pauri", "Kotdwara", "Lansdowne", "Srinagar"],
  Pithoragarh: ["Pithoragarh", "Dharchula", "Kausani", "Munsiari"],
  Rudraprayag: ["Rudraprayag", "Gopeshwar", "Karnaprayag", "Agastyamuni"],
  "Tehri Garhwal": ["Tehri", "New Tehri", "Chamba", "Dhanaulti"],
  Uttarkashi: ["Uttarkashi", "Harshil", "Dunda", "Gangnani"],
  Bageshwar: ["Bageshwar", "Kanda", "Kapkot", "Tharali"],
  "Udham Singh Nagar": [
    "Rudrapur",
    "Kashipur",
    "Jaspur",
    "Sitarganj",
    "Khatima",
    "Gadarpur",
    "Bazpur",
  ],
};

const cropOptions = ["Mandua", "Jhangora", "Ramdana", "Kauni", "Cheena"];

const pageClass =
  "flex min-h-full w-full items-start justify-center overflow-x-hidden bg-[#f0ece4] bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,rgba(2,75,55,0.10)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_92%_100%,rgba(134,179,116,0.14)_0%,transparent_55%)] px-5 py-8 font-lato max-[768px]:px-3 max-[768px]:py-5 max-[480px]:px-2 max-[480px]:py-4";
const cardClass =
  "flex w-full max-w-[1160px] flex-col rounded-[20px] border border-[#024b37]/[0.07] bg-white px-10 pb-12 pt-9 shadow-form-card max-[1100px]:px-7 max-[1100px]:pb-10 max-[1100px]:pt-7 max-[768px]:rounded-2xl max-[768px]:px-5 max-[768px]:pb-8 max-[768px]:pt-6 max-[480px]:rounded-xl max-[480px]:px-3.5 max-[480px]:pb-6 max-[480px]:pt-4 max-[480px]:shadow-[0_1px_3px_rgba(2,50,36,0.08)] max-[320px]:px-2.5 max-[320px]:pb-[18px] max-[320px]:pt-3";
const headerClass =
  "mb-8 flex items-start justify-between gap-5 border-b-[1.5px] border-[#eae6de] pb-7 max-[768px]:mb-6 max-[768px]:flex-col max-[768px]:gap-4 max-[768px]:pb-5 max-[480px]:mb-4 max-[480px]:items-stretch max-[480px]:gap-3 max-[480px]:pb-4";
const headerContentClass = "min-w-0 flex-1";
const headerTitleClass =
  "mb-1.5 mt-0 font-playfair text-[2.1rem] font-semibold leading-tight tracking-[-0.3px] text-[#023628] max-[768px]:mb-1 max-[768px]:text-[1.8rem] max-[480px]:text-2xl max-[320px]:text-[1.3rem]";
const headerTextClass =
  "m-0 text-[0.93rem] leading-normal text-[#5c6b5e] max-[768px]:text-[0.88rem] max-[480px]:text-[0.8rem] max-[480px]:text-[#6b7b70]";
const backButtonClass =
  "shrink-0 cursor-pointer whitespace-nowrap rounded-[10px] border-[1.5px] border-[#e0dbd0] bg-[#f5f3f0] px-4 py-2.5 text-[0.85rem] font-bold tracking-[0.02em] text-[#024b37] transition duration-200 hover:border-[#024b37] hover:bg-[#024b37] hover:text-white active:scale-[0.98] max-[768px]:w-full max-[768px]:px-3.5 max-[480px]:px-3 max-[480px]:py-[9px] max-[480px]:text-[0.8rem]";
const formClass = "flex flex-col gap-5";
const sectionClass =
  "rounded-2xl border border-[#e8e3d8] bg-[#faf9f6] px-[26px] pb-7 pt-6 transition duration-200 focus-within:border-[#024b37]/30 focus-within:bg-[#fdfcfb] max-[768px]:rounded-xl max-[768px]:px-4 max-[768px]:pb-[22px] max-[768px]:pt-[18px] max-[480px]:mb-2 max-[480px]:rounded-[10px] max-[480px]:px-3 max-[480px]:pb-4 max-[480px]:pt-3.5 max-[320px]:px-2.5 max-[320px]:pb-3.5 max-[320px]:pt-3 [&>h2]:mb-5 [&>h2]:mt-0 [&>h2]:flex [&>h2]:items-center [&>h2]:gap-2.5 [&>h2]:font-playfair [&>h2]:text-[1.05rem] [&>h2]:font-semibold [&>h2]:text-[#024b37] [&>h2]:before:inline-block [&>h2]:before:h-[18px] [&>h2]:before:w-1 [&>h2]:before:shrink-0 [&>h2]:before:rounded-[3px] [&>h2]:before:bg-[#024b37] [&>h2]:before:content-[''] max-[768px]:[&>h2]:mb-4 max-[768px]:[&>h2]:text-[0.98rem] max-[480px]:[&>h2]:mb-3 max-[480px]:[&>h2]:text-[0.92rem] max-[480px]:[&>h2]:before:h-4 max-[480px]:[&>h2]:before:w-[3px] max-[320px]:[&>h2]:text-[0.88rem]";
const gridClass =
  "grid grid-cols-3 gap-x-[22px] gap-y-[18px] max-[1100px]:grid-cols-2 max-[768px]:grid-cols-2 max-[768px]:gap-x-4 max-[768px]:gap-y-3.5 max-[480px]:grid-cols-1 max-[480px]:gap-2.5";
const fullWidthClass = "col-span-3 max-[1100px]:col-span-2 max-[480px]:col-span-1";
const fieldGroupClass =
  "flex flex-col gap-[7px] [&>label]:text-[0.82rem] [&>label]:font-bold [&>label]:uppercase [&>label]:tracking-[0.04em] [&>label]:text-[#2a3b2e] max-[768px]:[&>label]:text-[0.78rem] max-[480px]:[&>label]:text-[0.75rem] max-[480px]:[&>label]:tracking-[0.03em] [&>input]:appearance-none [&>input]:rounded-[10px] [&>input]:border-[1.5px] [&>input]:border-[#d8d2c6] [&>input]:bg-white [&>input]:px-3.5 [&>input]:py-[11px] [&>input]:font-lato [&>input]:text-[0.94rem] [&>input]:text-[#1a2b1e] [&>input]:outline-none [&>input]:transition [&>input]:duration-200 [&>input]:placeholder:text-[#a8a099] [&>input:hover]:border-[#a8c4b4] [&>input:focus]:border-[#024b37] [&>input:focus]:bg-[#f7fbf9] [&>input:focus]:shadow-[0_0_0_3px_rgba(2,75,55,0.10)] [&>select]:appearance-none [&>select]:rounded-[10px] [&>select]:border-[1.5px] [&>select]:border-[#d8d2c6] [&>select]:bg-white [&>select]:px-3.5 [&>select]:py-[11px] [&>select]:font-lato [&>select]:text-[0.94rem] [&>select]:text-[#1a2b1e] [&>select]:outline-none [&>select]:transition [&>select]:duration-200 [&>select:hover]:border-[#a8c4b4] [&>select:focus]:border-[#024b37] [&>select:focus]:bg-[#f7fbf9] [&>select:focus]:shadow-[0_0_0_3px_rgba(2,75,55,0.10)] [&>select:disabled]:cursor-not-allowed [&>select:disabled]:bg-[#f5f3f0] [&>select:disabled]:opacity-60 max-[768px]:[&>input]:px-3 max-[768px]:[&>input]:py-2.5 max-[768px]:[&>input]:text-[0.92rem] max-[768px]:[&>select]:px-3 max-[768px]:[&>select]:py-2.5 max-[768px]:[&>select]:text-[0.92rem] max-[480px]:[&>input]:rounded-lg max-[480px]:[&>input]:px-[11px] max-[480px]:[&>input]:py-[9px] max-[480px]:[&>input]:text-[0.9rem] max-[480px]:[&>select]:rounded-lg max-[480px]:[&>select]:px-[11px] max-[480px]:[&>select]:py-[9px] max-[480px]:[&>select]:text-[0.9rem] max-[320px]:[&>input]:px-2.5 max-[320px]:[&>input]:py-2 max-[320px]:[&>input]:text-[0.88rem] max-[320px]:[&>select]:px-2.5 max-[320px]:[&>select]:py-2 max-[320px]:[&>select]:text-[0.88rem]";
const errorControlClass =
  "!border-[#d14343] !bg-[#fff8f8] focus:!shadow-[0_0_0_3px_rgba(209,67,67,0.11)]";
const errorTextClass =
  "flex items-center gap-[5px] text-[0.8rem] font-bold tracking-[0.01em] text-[#c0392b] max-[480px]:text-[0.75rem]";
const checkboxGridClass =
  "mb-2 grid grid-cols-3 gap-x-3.5 gap-y-2.5 max-[1100px]:grid-cols-2 max-[768px]:grid-cols-2 max-[768px]:gap-x-3 max-[768px]:gap-y-2 max-[480px]:grid-cols-1 max-[480px]:gap-2";
const checkboxItemClass =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-[10px] border-[1.5px] border-[#e0dbd0] bg-white px-3.5 py-[11px] text-[0.88rem] font-bold text-[#2a3b2e] transition duration-150 hover:border-[#024b37] hover:bg-[#f3f9f6] max-[768px]:px-3 max-[768px]:py-2.5 max-[768px]:text-[0.86rem] max-[480px]:gap-2 max-[480px]:px-[11px] max-[480px]:py-[9px] max-[480px]:text-[0.8rem] [&_input]:m-0 [&_input]:h-4 [&_input]:w-4 [&_input]:shrink-0 [&_input]:cursor-pointer [&_input]:accent-[#024b37] max-[480px]:[&_input]:h-3.5 max-[480px]:[&_input]:w-3.5";
const leaseStatusClass = "col-span-3 max-[1100px]:col-span-2 max-[480px]:col-span-1";
const leaseOptionsClass =
  "mt-1 flex flex-wrap items-center gap-5 max-[480px]:mt-0.5 max-[480px]:gap-3";
const radioItemClass =
  "flex cursor-pointer select-none items-center gap-2 text-[0.91rem] font-bold text-[#2a3b2e] max-[480px]:gap-1.5 max-[480px]:text-[0.85rem] [&_input]:m-0 [&_input]:h-4 [&_input]:w-4 [&_input]:cursor-pointer [&_input]:accent-[#024b37]";
const declarationSectionClass =
  "mt-1 flex flex-col gap-1.5 border-0 bg-transparent px-0 pb-1.5 pt-[18px] max-[480px]:mt-0.5 max-[480px]:pb-1 max-[480px]:pt-3";
const declarationCheckboxClass =
  "flex cursor-pointer items-start gap-3 border-0 bg-transparent p-0 text-[0.88rem] font-bold leading-normal text-[#2a3b2e] max-[480px]:gap-2.5 max-[480px]:text-[0.8rem] [&_input]:mt-px [&_input]:h-[18px] [&_input]:w-[18px] [&_input]:shrink-0 [&_input]:cursor-pointer [&_input]:accent-[#024b37] max-[480px]:[&_input]:h-4 max-[480px]:[&_input]:w-4 [&_span]:flex-1";
const formActionsClass =
  "mt-3 flex justify-end gap-3 pt-3 max-[768px]:justify-stretch max-[480px]:mt-2 max-[480px]:flex-col max-[480px]:gap-2";
const submitButtonClass =
  "min-w-[200px] cursor-pointer rounded-xl border-0 bg-[#024b37] px-8 py-3.5 text-center font-lato text-[0.96rem] font-bold tracking-[0.03em] text-white shadow-[0_2px_8px_rgba(2,75,55,0.22)] transition duration-200 hover:-translate-y-px hover:bg-[#035e47] hover:shadow-[0_4px_16px_rgba(2,75,55,0.30)] active:translate-y-0 active:bg-[#023628] active:shadow-[0_1px_6px_rgba(2,75,55,0.20)] disabled:cursor-not-allowed disabled:bg-[#a8c4b4] disabled:opacity-80 disabled:shadow-none disabled:transform-none max-[768px]:w-full max-[768px]:min-w-0 max-[768px]:px-5 max-[768px]:py-3 max-[768px]:text-[0.92rem] max-[480px]:rounded-[10px] max-[480px]:px-4 max-[480px]:py-[11px] max-[480px]:text-[0.9rem] max-[320px]:px-3 max-[320px]:py-2.5 max-[320px]:text-[0.85rem]";
const statusBannerBase =
  "mb-6 flex animate-slide-down items-center gap-2.5 break-words rounded-xl px-[18px] py-3.5 text-[0.9rem] font-bold max-[480px]:mb-4 max-[480px]:rounded-[10px] max-[480px]:px-3.5 max-[480px]:py-3 max-[480px]:text-[0.85rem]";
const statusBannerClass = (type) =>
  `${statusBannerBase} ${
    type === "success"
      ? "border border-[#6dbf96] bg-[#edf7f2] text-[#065235]"
      : "border border-[#f5a9a9] bg-[#fef3f2] text-[#7a1c1c]"
  }`;
const controlErrorClass = (error) => (error ? errorControlClass : "");

const ifscPattern = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^\d{10}$/;

function RegisterFarmer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    father_name: "",
    mobile: "",
    email: "",
    address: "",
    district: "",
    block: "",
    group_president_name: "",
    crops: [],
    cultivator_name: "",
    cultivation_area: "",
    cultivation_khatauni: "",
    cultivation_khasra: "",
    lease_status: "no",
    lease_cultivator_name: "",
    lease_period: "",
    lease_khatauni: "",
    lease_khasra: "",
    lease_area: "",
    estimated_seed_date: "",
    estimated_yield: "",
    bank_name: "",
    account_number: "",
    ifsc: "",
    bank_address: "",
    account_holder_name: "",
    privacy_consent: false,
    declaration: false,
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentBlocks = formData.district
    ? blocksByDistrict[formData.district] || []
    : [];

  const handleInputChange = (event) => {
    const { name, value, checked } = event.target;

    if (name === "declaration" || name === "privacy_consent") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
      return;
    }

    if (name === "lease_status") {
      setFormData((prev) => ({
        ...prev,
        lease_status: value,
        lease_area: value === "no" ? "" : prev.lease_area,
      }));
      if (errors.lease_status) {
        setErrors((prev) => ({ ...prev, lease_status: "" }));
      }
      return;
    }

    if (name === "crops") {
      const updated = checked
        ? [...formData.crops, value]
        : formData.crops.filter((item) => item !== value);

      setFormData((prev) => ({ ...prev, crops: updated }));

      if (errors.crops) {
        setErrors((prev) => ({ ...prev, crops: "" }));
      }
      return;
    }

    if (name === "district") {
      setFormData((prev) => ({
        ...prev,
        district: value,
        block: "",
      }));
      if (errors.district) {
        setErrors((prev) => ({ ...prev, district: "" }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.full_name.trim()) {
      validationErrors.full_name = "Name of farmer/group is required";
    }
    if (!formData.father_name.trim()) {
      validationErrors.father_name = "Father / Husband name is required";
    }
    if (!formData.mobile.trim()) {
      validationErrors.mobile = "Mobile number is required";
    } else if (!mobilePattern.test(formData.mobile.trim())) {
      validationErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (formData.email.trim() && !emailPattern.test(formData.email.trim())) {
      validationErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      validationErrors.address = "Address is required";
    }

    if (!formData.district.trim()) {
      validationErrors.district = "District is required";
    }

    if (!formData.block.trim()) {
      validationErrors.block = "Block is required";
    }

    if (!formData.crops.length) {
      validationErrors.crops = "Select at least one crop";
    }

    if (!formData.cultivator_name.trim()) {
      validationErrors.cultivator_name = "Cultivator name is required";
    }

    if (!formData.cultivation_area.trim()) {
      validationErrors.cultivation_area = "Cultivation area is required";
    } else if (
      Number(formData.cultivation_area) <= 0 ||
      Number.isNaN(Number(formData.cultivation_area))
    ) {
      validationErrors.cultivation_area =
        "Cultivation area must be greater than 0";
    }

    if (!formData.cultivation_khatauni.trim()) {
      validationErrors.cultivation_khatauni =
        "Khatauni account number is required";
    }

    if (!formData.cultivation_khasra.trim()) {
      validationErrors.cultivation_khasra = "Khasra number is required";
    }

    if (formData.lease_status === "yes") {
      if (!formData.lease_cultivator_name.trim()) {
        validationErrors.lease_cultivator_name =
          "Lease cultivator name is required";
      }
      if (!formData.lease_period.trim()) {
        validationErrors.lease_period = "Lease period is required";
      }
      if (!formData.lease_khatauni.trim()) {
        validationErrors.lease_khatauni =
          "Lease khatauni account number is required";
      }
      if (!formData.lease_khasra.trim()) {
        validationErrors.lease_khasra = "Lease khasra number is required";
      }
      if (!formData.lease_area.trim()) {
        validationErrors.lease_area = "Lease area is required";
      } else if (
        Number(formData.lease_area) <= 0 ||
        Number.isNaN(Number(formData.lease_area))
      ) {
        validationErrors.lease_area = "Lease area must be greater than 0";
      }
    }

    if (!formData.estimated_seed_date.trim()) {
      validationErrors.estimated_seed_date =
        "Estimated seed sowing date is required";
    }

    if (!formData.estimated_yield.trim()) {
      validationErrors.estimated_yield = "Estimated yield is required";
    }

    if (!formData.bank_name.trim()) {
      validationErrors.bank_name = "Bank name is required";
    }

    if (!formData.account_number.trim()) {
      validationErrors.account_number = "Account number is required";
    } else if (!/^\d+$/.test(formData.account_number.trim())) {
      validationErrors.account_number =
        "Account number must contain only numbers";
    } else if (!/^\d{9,18}$/.test(formData.account_number.trim())) {
      validationErrors.account_number =
        "Account number must be between 9 and 18 digits";
    }

    if (!formData.ifsc.trim()) {
      validationErrors.ifsc = "IFSC code is required";
    } else if (!ifscPattern.test(formData.ifsc.trim())) {
      validationErrors.ifsc = "IFSC must match the correct format";
    }

    if (!formData.bank_address.trim()) {
      validationErrors.bank_address = "Bank address is required";
    }

    if (!formData.account_holder_name.trim()) {
      validationErrors.account_holder_name = "Account holder name is required";
    }

    if (!formData.privacy_consent) {
      validationErrors.privacy_consent =
        "You must consent to personal data processing for registration";
    }

    if (!formData.declaration) {
      validationErrors.declaration =
        "You must agree to the declaration before submitting";
    }

    return validationErrors;
  };

  const formatPayload = () => ({
    farmer: {
      name: formData.full_name.trim(),
      father_husband_name: formData.father_name.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim() || null,
      address: formData.address.trim(),
      group_president_name: formData.group_president_name.trim() || null,
      bank_account_number: formData.account_number.trim(),
      bank_ifsc: formData.ifsc.trim().toUpperCase(),
      bank_name_address: `${formData.bank_name.trim()} - ${formData.bank_address.trim()}`,
      district_name: formData.district,
      block_name: formData.block,
      account_holder_name: formData.account_holder_name.trim(),
      crops: formData.crops,
      estimated_seed_date: formData.estimated_seed_date,
      estimated_yield: formData.estimated_yield.trim(),
    },
    land_parcels: [
      {
        khatauni_number: formData.cultivation_khatauni.trim(),
        khasra_number: formData.cultivation_khasra.trim(),
        area_value: Number(formData.cultivation_area),
        area_unit: "hectare",
        ownership_type: "owned",
        cultivator_name: formData.cultivator_name.trim(),
      },
      ...(formData.lease_status === "yes"
        ? [
            {
              khatauni_number: formData.lease_khatauni.trim(),
              khasra_number: formData.lease_khasra.trim(),
              area_value: Number(formData.lease_area),
              area_unit: "hectare",
              ownership_type: "leased",
              cultivator_name: formData.lease_cultivator_name.trim(),
              lease_period: formData.lease_period.trim(),
            },
          ]
        : []),
    ],
    consent_accepted: formData.privacy_consent,
    consent_text_version: "farmer-registration-v1",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      await registerFarmer(formatPayload());
      setStatusType("success");
      setStatusMessage(
        "Farmer registration submitted successfully. Redirecting to home..."
      );
      setTimeout(() => navigate("/"), 1600);
    } catch (error) {
      const backendMessage =
        error.response?.data?.detail ||
        error.message ||
        "Farmer registration failed. Please try again.";
      setStatusType("error");
      setStatusMessage(backendMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={pageClass}>
      <div className={cardClass}>
        <div className={headerClass}>
          <div className={headerContentClass}>
            <h1 className={headerTitleClass}>Farmer Registration</h1>
            <p className={headerTextClass}>Complete the application form in one screen.</p>
          </div>
          <button
            type="button"
            className={backButtonClass}
            onClick={() => navigate("/")}
            aria-label="Back to Home"
          >
            Back to Home
          </button>
        </div>

        {statusMessage && (
          <div className={statusBannerClass(statusType)} role="alert">
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={formClass}>
          <div className={sectionClass}>
            <h2>Farmer / Group Details</h2>
            <div className={gridClass}>
              <div className={`${fieldGroupClass} ${fullWidthClass}`}>
                <label htmlFor="full_name">
                  Name of Farmer / Group / FPO / SHG / NRLM Group
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.full_name)}
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <span className={errorTextClass}>{errors.full_name}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="father_name">Father / Husband&apos;s Name</label>
                <input
                  id="father_name"
                  name="father_name"
                  type="text"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.father_name)}
                  placeholder="Enter name"
                />
                {errors.father_name && (
                  <span className={errorTextClass}>{errors.father_name}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.mobile)}
                  placeholder="10-digit number"
                  maxLength="10"
                />
                {errors.mobile && (
                  <span className={errorTextClass}>{errors.mobile}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.email)}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <span className={errorTextClass}>{errors.email}</span>
                )}
              </div>

              <div className={`${fieldGroupClass} ${fullWidthClass}`}>
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.address)}
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <span className={errorTextClass}>{errors.address}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="district">District</label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.district)}
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <span className={errorTextClass}>{errors.district}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="block">Block</label>
                <select
                  id="block"
                  name="block"
                  value={formData.block}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.block)}
                  disabled={!currentBlocks.length}
                >
                  <option value="">Select block</option>
                  {currentBlocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
                {errors.block && (
                  <span className={errorTextClass}>{errors.block}</span>
                )}
              </div>

              <div className={`${fieldGroupClass} ${fullWidthClass}`}>
                <label htmlFor="group_president_name">
                  Name of Group President (if applicable)
                </label>
                <input
                  id="group_president_name"
                  name="group_president_name"
                  type="text"
                  value={formData.group_president_name}
                  onChange={handleInputChange}
                  placeholder="Enter name (optional)"
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h2>Land under Millet Cultivation</h2>
            <div className={checkboxGridClass}>
              {cropOptions.map((crop) => (
                <label key={crop} className={checkboxItemClass}>
                  <input
                    type="checkbox"
                    name="crops"
                    value={crop}
                    checked={formData.crops.includes(crop)}
                    onChange={handleInputChange}
                  />
                  <span>{crop}</span>
                </label>
              ))}
            </div>
            {errors.crops && <span className={errorTextClass}>{errors.crops}</span>}

            <div className={gridClass}>
              <div className={fieldGroupClass}>
                <label htmlFor="cultivator_name">Name of Cultivator(s)</label>
                <input
                  id="cultivator_name"
                  name="cultivator_name"
                  type="text"
                  value={formData.cultivator_name}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.cultivator_name)}
                  placeholder="Enter cultivator name"
                />
                {errors.cultivator_name && (
                  <span className={errorTextClass}>{errors.cultivator_name}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="cultivation_area">Area (Acre / Hectare)</label>
                <input
                  id="cultivation_area"
                  name="cultivation_area"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cultivation_area}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.cultivation_area)}
                  placeholder="0.00"
                />
                {errors.cultivation_area && (
                  <span className={errorTextClass}>{errors.cultivation_area}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="cultivation_khatauni">
                  Khatauni Account Number
                </label>
                <input
                  id="cultivation_khatauni"
                  name="cultivation_khatauni"
                  type="text"
                  value={formData.cultivation_khatauni}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.cultivation_khatauni)}
                  placeholder="Enter khatauni number"
                />
                {errors.cultivation_khatauni && (
                  <span className={errorTextClass}>
                    {errors.cultivation_khatauni}
                  </span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="cultivation_khasra">Khasra Number</label>
                <input
                  id="cultivation_khasra"
                  name="cultivation_khasra"
                  type="text"
                  value={formData.cultivation_khasra}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.cultivation_khasra)}
                  placeholder="Enter khasra number"
                />
                {errors.cultivation_khasra && (
                  <span className={errorTextClass}>{errors.cultivation_khasra}</span>
                )}
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h2>Land taken on lease</h2>
            <div className={gridClass}>
              <div className={`${fieldGroupClass} ${leaseStatusClass}`}>
                <label>Lease status</label>
                <div className={leaseOptionsClass}>
                  <label className={radioItemClass}>
                    <input
                      type="radio"
                      name="lease_status"
                      value="yes"
                      checked={formData.lease_status === "yes"}
                      onChange={handleInputChange}
                    />
                    <span>Yes</span>
                  </label>
                  <label className={radioItemClass}>
                    <input
                      type="radio"
                      name="lease_status"
                      value="no"
                      checked={formData.lease_status === "no"}
                      onChange={handleInputChange}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {formData.lease_status === "yes" && (
                <>
                  <div className={fieldGroupClass}>
                    <label htmlFor="lease_cultivator_name">
                      Name of Cultivator(s)
                    </label>
                    <input
                      id="lease_cultivator_name"
                      name="lease_cultivator_name"
                      type="text"
                      value={formData.lease_cultivator_name}
                      onChange={handleInputChange}
                      className={controlErrorClass(errors.lease_cultivator_name)}
                      placeholder="Enter cultivator name"
                    />
                    {errors.lease_cultivator_name && (
                      <span className={errorTextClass}>
                        {errors.lease_cultivator_name}
                      </span>
                    )}
                  </div>

                  <div className={fieldGroupClass}>
                    <label htmlFor="lease_period">Lease period</label>
                    <input
                      id="lease_period"
                      name="lease_period"
                      type="text"
                      value={formData.lease_period}
                      onChange={handleInputChange}
                      className={controlErrorClass(errors.lease_period)}
                      placeholder="e.g., 2 years"
                    />
                    {errors.lease_period && (
                      <span className={errorTextClass}>{errors.lease_period}</span>
                    )}
                  </div>

                  <div className={fieldGroupClass}>
                    <label htmlFor="lease_khatauni">
                      Khatauni Account Number
                    </label>
                    <input
                      id="lease_khatauni"
                      name="lease_khatauni"
                      type="text"
                      value={formData.lease_khatauni}
                      onChange={handleInputChange}
                      className={controlErrorClass(errors.lease_khatauni)}
                      placeholder="Enter khatauni number"
                    />
                    {errors.lease_khatauni && (
                      <span className={errorTextClass}>{errors.lease_khatauni}</span>
                    )}
                  </div>

                  <div className={fieldGroupClass}>
                    <label htmlFor="lease_khasra">Khasra Number</label>
                    <input
                      id="lease_khasra"
                      name="lease_khasra"
                      type="text"
                      value={formData.lease_khasra}
                      onChange={handleInputChange}
                      className={controlErrorClass(errors.lease_khasra)}
                      placeholder="Enter khasra number"
                    />
                    {errors.lease_khasra && (
                      <span className={errorTextClass}>{errors.lease_khasra}</span>
                    )}
                  </div>

                  <div className={fieldGroupClass}>
                    <label htmlFor="lease_area">Area (Acre / Hectare)</label>
                    <input
                      id="lease_area"
                      name="lease_area"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.lease_area}
                      onChange={handleInputChange}
                      className={controlErrorClass(errors.lease_area)}
                      placeholder="0.00"
                    />
                    {errors.lease_area && (
                      <span className={errorTextClass}>{errors.lease_area}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={sectionClass}>
            <h2>Estimates</h2>
            <div className={gridClass}>
              <div className={fieldGroupClass}>
                <label htmlFor="estimated_seed_date">
                  Estimated date of seed sowing
                </label>
                <input
                  id="estimated_seed_date"
                  name="estimated_seed_date"
                  type="date"
                  value={formData.estimated_seed_date}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.estimated_seed_date)}
                />
                {errors.estimated_seed_date && (
                  <span className={errorTextClass}>
                    {errors.estimated_seed_date}
                  </span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="estimated_yield">Estimated yield</label>
                <input
                  id="estimated_yield"
                  name="estimated_yield"
                  type="text"
                  value={formData.estimated_yield}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.estimated_yield)}
                  placeholder="Enter estimated yield"
                />
                {errors.estimated_yield && (
                  <span className={errorTextClass}>{errors.estimated_yield}</span>
                )}
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h2>Bank Details</h2>
            <div className={gridClass}>
              <div className={fieldGroupClass}>
                <label htmlFor="bank_name">Bank Name</label>
                <input
                  id="bank_name"
                  name="bank_name"
                  type="text"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.bank_name)}
                  placeholder="Enter bank name"
                />
                {errors.bank_name && (
                  <span className={errorTextClass}>{errors.bank_name}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="account_number">
                  Bank account number of Farmer / Group
                </label>
                <input
                  id="account_number"
                  name="account_number"
                  type="text"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.account_number)}
                  placeholder="Enter account number"
                />
                {errors.account_number && (
                  <span className={errorTextClass}>{errors.account_number}</span>
                )}
              </div>

              <div className={fieldGroupClass}>
                <label htmlFor="ifsc">Bank IFSC Code</label>
                <input
                  id="ifsc"
                  name="ifsc"
                  type="text"
                  value={formData.ifsc}
                  onChange={handleInputChange}
                  className={`${controlErrorClass(errors.ifsc)} uppercase`}
                  placeholder="e.g., SBIN0001234"
                />
                {errors.ifsc && (
                  <span className={errorTextClass}>{errors.ifsc}</span>
                )}
              </div>

              <div className={`${fieldGroupClass} ${fullWidthClass}`}>
                <label htmlFor="bank_address">Name and address of Bank</label>
                <input
                  id="bank_address"
                  name="bank_address"
                  type="text"
                  value={formData.bank_address}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.bank_address)}
                  placeholder="Enter bank address"
                />
                {errors.bank_address && (
                  <span className={errorTextClass}>{errors.bank_address}</span>
                )}
              </div>

              <div className={`${fieldGroupClass} ${fullWidthClass}`}>
                <label htmlFor="account_holder_name">Account Holder Name</label>
                <input
                  id="account_holder_name"
                  name="account_holder_name"
                  type="text"
                  value={formData.account_holder_name}
                  onChange={handleInputChange}
                  className={controlErrorClass(errors.account_holder_name)}
                  placeholder="Enter account holder name"
                />
                {errors.account_holder_name && (
                  <span className={errorTextClass}>
                    {errors.account_holder_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={declarationSectionClass}>
            <label className={declarationCheckboxClass}>
              <input
                id="privacy_consent"
                name="privacy_consent"
                type="checkbox"
                checked={formData.privacy_consent}
                onChange={handleInputChange}
              />
              <span>
                I consent to the Department processing the personal, bank, and
                land details submitted here for farmer registration, scheme
                administration, and enrollment verification by authorized
                officials.
              </span>
            </label>
            {errors.privacy_consent && (
              <span className={errorTextClass}>{errors.privacy_consent}</span>
            )}

            <label className={declarationCheckboxClass}>
              <input
                id="declaration"
                name="declaration"
                type="checkbox"
                checked={formData.declaration}
                onChange={handleInputChange}
              />
              <span>
                I declare that the information provided above is correct and
                complete.
              </span>
            </label>
            {errors.declaration && (
              <span className={errorTextClass}>{errors.declaration}</span>
            )}
          </div>

          <div className={formActionsClass}>
            <button type="submit" className={submitButtonClass} disabled={submitting}>
              {submitting ? "Registering Farmer..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterFarmer;
