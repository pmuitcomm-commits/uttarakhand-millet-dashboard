import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerFarmer } from "../services/api";
import "../styles/login.css";
import "../styles/register-farmer.css";

const districts = [
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nainital",
  "Pauri",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri",
  "Uttarkashi",
];

const blocksByDistrict = {
  Nainital: ["Nainital", "Bhimtal", "Haldwani", "Ramnagar"],
  Almora: ["Almora", "Chaukhutia", "Hawalbagh", "Ranikhet"],
  Dehradun: ["Dehradun", "Vikasnagar", "Doiwala", "Raipur"],
  Haridwar: ["Haridwar", "Khanpur", "Lakhanpur", "Bahadarabad"],
  Chamoli: ["Gopeshwar", "Joshimath", "Chamoli", "Tharali"],
  Champawat: ["Champawat", "Lohaghat", "Pati", "Pancheshwar"],
  Pauri: ["Pauri", "Kotdwara", "Lansdowne", "Srinagar"],
  Pithoragarh: ["Pithoragarh", "Dharchula", "Kausani", "Munsiari"],
  Rudraprayag: ["Rudraprayag", "Gopeshwar", "Karnaprayag", "Agastyamuni"],
  Tehri: ["Tehri", "New Tehri", "Chamba", "Dhanaulti"],
  Uttarkashi: ["Uttarkashi", "Harshil", "Dunda", "Gangnani"],
  Bageshwar: ["Bageshwar", "Kanda", "Kapkot", "Tharali"],
};

const cropOptions = ["Mandua", "Jhangora", "Sawa", "Ramdana", "Kauni", "Cheena"];

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
    declaration: false,
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentBlocks = formData.district
    ? blocksByDistrict[formData.district] || []
    : [];

  const handleInputChange = (event) => {
    const { name, value, checked } = event.target;

    if (name === "declaration") {
      setFormData((prev) => ({ ...prev, declaration: checked }));
      if (errors.declaration) {
        setErrors((prev) => ({ ...prev, declaration: "" }));
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
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      await registerFarmer(formatPayload());
      setStatusMessage(
        "Farmer registration submitted successfully. Redirecting to login..."
      );
      setTimeout(() => navigate("/"), 1600);
    } catch (error) {
      const backendMessage =
        error.response?.data?.detail ||
        "Farmer registration failed. Please try again.";
      setStatusMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-farmer-page">
      <div className="register-farmer-card">
        <div className="register-farmer-header">
          <div>
            <h1>Farmer Registration</h1>
            <p>Complete the application form in one screen.</p>
          </div>
          <button
            type="button"
            className="header-btn"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        </div>

        {statusMessage && (
          <div
            className={`status-banner ${
              statusMessage.includes("successfully")
                ? "success"
                : "error-banner"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-farmer-form">
          <div className="form-section">
            <h2>Farmer / Group Details</h2>
            <div className="form-grid">
              <div className="field-group full-width">
                <label htmlFor="full_name">
                  Name of Farmer / Group / FPO / SHG / NRLM Group
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={errors.full_name ? "error" : ""}
                />
                {errors.full_name && (
                  <span className="error-text">{errors.full_name}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="father_name">Father / Husband&apos;s Name</label>
                <input
                  id="father_name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  className={errors.father_name ? "error" : ""}
                />
                {errors.father_name && (
                  <span className="error-text">{errors.father_name}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={errors.mobile ? "error" : ""}
                />
                {errors.mobile && (
                  <span className="error-text">{errors.mobile}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="field-group full-width">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? "error" : ""}
                />
                {errors.address && (
                  <span className="error-text">{errors.address}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="district">District</label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={errors.district ? "error" : ""}
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <span className="error-text">{errors.district}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="block">Block</label>
                <select
                  id="block"
                  name="block"
                  value={formData.block}
                  onChange={handleInputChange}
                  className={errors.block ? "error" : ""}
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
                  <span className="error-text">{errors.block}</span>
                )}
              </div>

              <div className="field-group full-width">
                <label htmlFor="group_president_name">
                  Name of Group President (if applicable)
                </label>
                <input
                  id="group_president_name"
                  name="group_president_name"
                  value={formData.group_president_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Land under Millet Cultivation</h2>
            <div className="checkbox-grid">
              {cropOptions.map((crop) => (
                <label key={crop} className="checkbox-item">
                  <input
                    type="checkbox"
                    name="crops"
                    value={crop}
                    checked={formData.crops.includes(crop)}
                    onChange={handleInputChange}
                  />
                  {crop}
                </label>
              ))}
            </div>
            {errors.crops && <span className="error-text">{errors.crops}</span>}

            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="cultivator_name">Name of Cultivator(s)</label>
                <input
                  id="cultivator_name"
                  name="cultivator_name"
                  value={formData.cultivator_name}
                  onChange={handleInputChange}
                  className={errors.cultivator_name ? "error" : ""}
                />
                {errors.cultivator_name && (
                  <span className="error-text">{errors.cultivator_name}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="cultivation_area">Area (Acre / Hectare)</label>
                <input
                  id="cultivation_area"
                  name="cultivation_area"
                  type="number"
                  min="0"
                  value={formData.cultivation_area}
                  onChange={handleInputChange}
                  className={errors.cultivation_area ? "error" : ""}
                />
                {errors.cultivation_area && (
                  <span className="error-text">{errors.cultivation_area}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="cultivation_khatauni">
                  Khatauni Account Number
                </label>
                <input
                  id="cultivation_khatauni"
                  name="cultivation_khatauni"
                  value={formData.cultivation_khatauni}
                  onChange={handleInputChange}
                  className={errors.cultivation_khatauni ? "error" : ""}
                />
                {errors.cultivation_khatauni && (
                  <span className="error-text">
                    {errors.cultivation_khatauni}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="cultivation_khasra">Khasra Number</label>
                <input
                  id="cultivation_khasra"
                  name="cultivation_khasra"
                  value={formData.cultivation_khasra}
                  onChange={handleInputChange}
                  className={errors.cultivation_khasra ? "error" : ""}
                />
                {errors.cultivation_khasra && (
                  <span className="error-text">{errors.cultivation_khasra}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Land taken on lease</h2>
            <div className="form-grid lease-grid">
              <div className="field-group lease-status-group">
                <label>Lease status</label>
                <div className="lease-options">
                  <label>
                    <input
                      type="radio"
                      name="lease_status"
                      value="yes"
                      checked={formData.lease_status === "yes"}
                      onChange={handleInputChange}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="lease_status"
                      value="no"
                      checked={formData.lease_status === "no"}
                      onChange={handleInputChange}
                    />
                    No
                  </label>
                </div>
              </div>

              {formData.lease_status === "yes" && (
                <>
                  <div className="field-group">
                    <label htmlFor="lease_cultivator_name">
                      Name of Cultivator(s)
                    </label>
                    <input
                      id="lease_cultivator_name"
                      name="lease_cultivator_name"
                      value={formData.lease_cultivator_name}
                      onChange={handleInputChange}
                      className={errors.lease_cultivator_name ? "error" : ""}
                    />
                    {errors.lease_cultivator_name && (
                      <span className="error-text">
                        {errors.lease_cultivator_name}
                      </span>
                    )}
                  </div>

                  <div className="field-group">
                    <label htmlFor="lease_period">Lease period</label>
                    <input
                      id="lease_period"
                      name="lease_period"
                      value={formData.lease_period}
                      onChange={handleInputChange}
                      className={errors.lease_period ? "error" : ""}
                    />
                    {errors.lease_period && (
                      <span className="error-text">{errors.lease_period}</span>
                    )}
                  </div>

                  <div className="field-group">
                    <label htmlFor="lease_khatauni">
                      Khatauni Account Number
                    </label>
                    <input
                      id="lease_khatauni"
                      name="lease_khatauni"
                      value={formData.lease_khatauni}
                      onChange={handleInputChange}
                      className={errors.lease_khatauni ? "error" : ""}
                    />
                    {errors.lease_khatauni && (
                      <span className="error-text">{errors.lease_khatauni}</span>
                    )}
                  </div>

                  <div className="field-group">
                    <label htmlFor="lease_khasra">Khasra Number</label>
                    <input
                      id="lease_khasra"
                      name="lease_khasra"
                      value={formData.lease_khasra}
                      onChange={handleInputChange}
                      className={errors.lease_khasra ? "error" : ""}
                    />
                    {errors.lease_khasra && (
                      <span className="error-text">{errors.lease_khasra}</span>
                    )}
                  </div>

                  <div className="field-group">
                    <label htmlFor="lease_area">Area (Acre / Hectare)</label>
                    <input
                      id="lease_area"
                      name="lease_area"
                      type="number"
                      min="0"
                      value={formData.lease_area}
                      onChange={handleInputChange}
                      className={errors.lease_area ? "error" : ""}
                    />
                    {errors.lease_area && (
                      <span className="error-text">{errors.lease_area}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2>Estimates</h2>
            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="estimated_seed_date">
                  Estimated date of seed sowing
                </label>
                <input
                  id="estimated_seed_date"
                  name="estimated_seed_date"
                  type="date"
                  value={formData.estimated_seed_date}
                  onChange={handleInputChange}
                  className={errors.estimated_seed_date ? "error" : ""}
                />
                {errors.estimated_seed_date && (
                  <span className="error-text">
                    {errors.estimated_seed_date}
                  </span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="estimated_yield">Estimated yield</label>
                <input
                  id="estimated_yield"
                  name="estimated_yield"
                  value={formData.estimated_yield}
                  onChange={handleInputChange}
                  className={errors.estimated_yield ? "error" : ""}
                />
                {errors.estimated_yield && (
                  <span className="error-text">{errors.estimated_yield}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Bank Details</h2>
            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="bank_name">Bank Name</label>
                <input
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  className={errors.bank_name ? "error" : ""}
                />
                {errors.bank_name && (
                  <span className="error-text">{errors.bank_name}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="account_number">
                  Bank account number of Farmer / Group
                </label>
                <input
                  id="account_number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  className={errors.account_number ? "error" : ""}
                />
                {errors.account_number && (
                  <span className="error-text">{errors.account_number}</span>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="ifsc">Bank IFSC Code</label>
                <input
                  id="ifsc"
                  name="ifsc"
                  value={formData.ifsc}
                  onChange={handleInputChange}
                  className={errors.ifsc ? "error" : ""}
                />
                {errors.ifsc && (
                  <span className="error-text">{errors.ifsc}</span>
                )}
              </div>

              <div className="field-group full-width">
                <label htmlFor="bank_address">Name and address of Bank</label>
                <input
                  id="bank_address"
                  name="bank_address"
                  value={formData.bank_address}
                  onChange={handleInputChange}
                  className={errors.bank_address ? "error" : ""}
                />
                {errors.bank_address && (
                  <span className="error-text">{errors.bank_address}</span>
                )}
              </div>

              <div className="field-group full-width">
                <label htmlFor="account_holder_name">Account Holder Name</label>
                <input
                  id="account_holder_name"
                  name="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={handleInputChange}
                  className={errors.account_holder_name ? "error" : ""}
                />
                {errors.account_holder_name && (
                  <span className="error-text">
                    {errors.account_holder_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section declaration-row">
            <label className="checkbox-item declaration-checkbox">
              <input
                id="declaration"
                name="declaration"
                type="checkbox"
                checked={formData.declaration}
                onChange={handleInputChange}
              />
              I declare that the information provided above is correct and
              complete.
            </label>
            {errors.declaration && (
              <span className="error-text">{errors.declaration}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? "Registering Farmer..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterFarmer;