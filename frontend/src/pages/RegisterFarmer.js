import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../styles/login.css';

const districts = [
  'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
  'Haridwar', 'Nainital', 'Pauri', 'Pithoragarh', 'Rudraprayag', 'Tehri', 'Uttarkashi'
];

const blocksByDistrict = {
  Nainital: ['Nainital', 'Bhimtal', 'Haldwani', 'Ramnagar'],
  Almora: ['Almora', 'Chaukhutia', 'Hawalbagh', 'Ranikhet'],
  Dehradun: ['Dehradun', 'Vikasnagar', 'Doiwala', 'Raipur'],
  Haridwar: ['Haridwar', 'Khanpur', 'Lakhanpur', 'Bahadarabad'],
  Chamoli: ['Gopeshwar', 'Joshimath', 'Chamoli', 'Tharali'],
  Champawat: ['Champawat', 'Lohaghat', 'Pati', 'Pancheshwar'],
  Pauri: ['Pauri', 'Kotdwara', 'Lansdowne', 'Srinagar'],
  Pithoragarh: ['Pithoragarh', 'Dharchula', 'Kausani', 'Munsiari'],
  Rudraprayag: ['Rudraprayag', 'Gopeshwar', 'Karnaprayag', 'Agastyamuni'],
  Tehri: ['Tehri', 'New Tehri', 'Chamba', 'Dhanaulti'],
  Uttarkashi: ['Uttarkashi', 'Harshil', 'Dunda', 'Gangnani'],
  Bageshwar: ['Bageshwar', 'Kanda', 'Kapkot', 'Tharali'],
};

const irrigationTypes = ['Canal', 'Tube Well', 'Rainfed', 'Drip', 'Sprinkler', 'Other'];
const cropOptions = ['Mandua', 'Jhangora', 'Sawa', 'Ramdana', 'Kauni', 'Cheena'];

const ifscPattern = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^\d{10}$/;

function RegisterFarmer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    mobile: '',
    email: '',
    address: '',
    district: '',
    block: '',
    khasra_number: '',
    khatauni_number: '',
    land_area: '',
    irrigation_type: '',
    lease_status: 'no',
    lease_duration: '',
    crops: [],
    bank_name: '',
    account_number: '',
    ifsc: '',
    account_holder_name: '',
    declaration: false,
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentBlocks = formData.district ? blocksByDistrict[formData.district] || [] : [];

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === 'declaration') {
      setFormData((prev) => ({ ...prev, declaration: checked }));
      if (errors.declaration) {
        setErrors((prev) => ({ ...prev, declaration: '' }));
      }
      return;
    }

    if (name === 'lease_status') {
      setFormData((prev) => ({
        ...prev,
        lease_status: value,
        lease_duration: value === 'no' ? '' : prev.lease_duration,
      }));
      setErrors((prev) => ({ ...prev, lease_status: '' }));
      return;
    }

    if (name === 'crops') {
      const cropValue = event.target.value;
      setFormData((prev) => {
        const checkedCrops = checked
          ? [...prev.crops, cropValue]
          : prev.crops.filter((item) => item !== cropValue);
        return { ...prev, crops: checkedCrops };
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'district') {
      setFormData((prev) => ({ ...prev, block: '' }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.full_name.trim()) {
      validationErrors.full_name = 'Full name is required';
    }

    if (!formData.father_name.trim()) {
      validationErrors.father_name = 'Father name is required';
    }

    if (!formData.mobile.trim()) {
      validationErrors.mobile = 'Mobile number is required';
    } else if (!mobilePattern.test(formData.mobile.trim())) {
      validationErrors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (formData.email.trim() && !emailPattern.test(formData.email.trim())) {
      validationErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      validationErrors.address = 'Address is required';
    }

    if (!formData.district) {
      validationErrors.district = 'District is required';
    }

    if (!formData.block) {
      validationErrors.block = 'Block is required';
    }

    if (!formData.khasra_number.trim()) {
      validationErrors.khasra_number = 'Khasra number is required';
    }

    if (!formData.khatauni_number.trim()) {
      validationErrors.khatauni_number = 'Khatauni number is required';
    }

    if (!formData.land_area.trim()) {
      validationErrors.land_area = 'Land area is required';
    } else if (Number(formData.land_area) <= 0 || Number.isNaN(Number(formData.land_area))) {
      validationErrors.land_area = 'Land area must be greater than 0';
    }

    if (!formData.irrigation_type) {
      validationErrors.irrigation_type = 'Irrigation type is required';
    }

    if (!formData.lease_status) {
      validationErrors.lease_status = 'Lease status is required';
    }

    if (formData.lease_status === 'yes') {
      if (!formData.lease_duration.trim()) {
        validationErrors.lease_duration = 'Lease duration is required when leasing';
      } else if (Number(formData.lease_duration) <= 0 || Number.isNaN(Number(formData.lease_duration))) {
        validationErrors.lease_duration = 'Lease duration must be a positive number';
      }
    }

    if (!formData.bank_name.trim()) {
      validationErrors.bank_name = 'Bank name is required';
    }

    if (!formData.account_number.trim()) {
      validationErrors.account_number = 'Account number is required';
    } else if (!/^\d+$/.test(formData.account_number.trim())) {
      validationErrors.account_number = 'Account number must contain only numbers';
    }

    if (!formData.ifsc.trim()) {
      validationErrors.ifsc = 'IFSC code is required';
    } else if (!ifscPattern.test(formData.ifsc.trim())) {
      validationErrors.ifsc = 'IFSC must match the correct format';
    }

    if (!formData.account_holder_name.trim()) {
      validationErrors.account_holder_name = 'Account holder name is required';
    }

    if (!formData.declaration) {
      validationErrors.declaration = 'You must agree to the declaration before submitting';
    }

    return validationErrors;
  };

  const formatPayload = () => ({
    username: formData.mobile.trim(),
    password: `${formData.mobile.trim()}@123`,
    role: 'farmer',
    full_name: formData.full_name.trim(),
    email: formData.email.trim() || null,
    district: formData.district,
    block: formData.block,
    farmer_profile: {
      father_name: formData.father_name.trim(),
      mobile: formData.mobile.trim(),
      address: formData.address.trim(),
      khasra_number: formData.khasra_number.trim(),
      khatauni_number: formData.khatauni_number.trim(),
      land_area: Number(formData.land_area),
      irrigation_type: formData.irrigation_type,
      lease_status: formData.lease_status,
      lease_duration: formData.lease_status === 'yes' ? formData.lease_duration.trim() : null,
      crops: formData.crops,
      bank_name: formData.bank_name.trim(),
      account_number: formData.account_number.trim(),
      ifsc: formData.ifsc.trim().toUpperCase(),
      account_holder_name: formData.account_holder_name.trim(),
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(formatPayload());
      setStatusMessage('Farmer registered successfully. Redirecting to login...');
      setTimeout(() => navigate('/'), 1600);
    } catch (error) {
      const backendMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      setStatusMessage(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container" style={{ padding: '32px 20px' }}>
      <div className="login-card" style={{ maxWidth: '820px', width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Register Farmer</h2>
            <p style={{ margin: '10px 0 0', color: '#4a5568' }}>Complete the form below to register a farmer profile.</p>
          </div>
          <button type="button" className="header-btn" onClick={() => navigate('/')}>
            Back to Login
          </button>
        </div>

        {statusMessage && (
          <div
            className="error-banner"
            style={{
              background: statusMessage.includes('successfully') ? 'rgba(16, 185, 129, 0.15)' : undefined,
              border: statusMessage.includes('successfully') ? '1px solid #10b981' : undefined,
              color: statusMessage.includes('successfully') ? '#064e3b' : undefined,
            }}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#024b37' }}>Farmer Details</h3>
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className={errors.full_name ? 'error' : ''}
              />
              {errors.full_name && <span className="error-text">{errors.full_name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="father_name">Father Name</label>
              <input
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleInputChange}
                placeholder="Enter father name"
                className={errors.father_name ? 'error' : ''}
              />
              {errors.father_name && <span className="error-text">{errors.father_name}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#024b37' }}>Contact</h3>
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter 10 digit mobile number"
                className={errors.mobile ? 'error' : ''}
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="district">District</label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className={errors.district ? 'error' : ''}
              >
                <option value="">Select district</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {errors.district && <span className="error-text">{errors.district}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="block">Block</label>
              <select
                id="block"
                name="block"
                value={formData.block}
                onChange={handleInputChange}
                className={errors.block ? 'error' : ''}
                disabled={!currentBlocks.length}
              >
                <option value="">Select block</option>
                {currentBlocks.map((block) => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
              {errors.block && <span className="error-text">{errors.block}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#024b37' }}>Land Details</h3>
            <div className="form-group">
              <label htmlFor="khasra_number">Khasra Number</label>
              <input
                id="khasra_number"
                name="khasra_number"
                value={formData.khasra_number}
                onChange={handleInputChange}
                placeholder="Enter khasra number"
                className={errors.khasra_number ? 'error' : ''}
              />
              {errors.khasra_number && <span className="error-text">{errors.khasra_number}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="khatauni_number">Khatauni Number</label>
              <input
                id="khatauni_number"
                name="khatauni_number"
                value={formData.khatauni_number}
                onChange={handleInputChange}
                placeholder="Enter khatauni number"
                className={errors.khatauni_number ? 'error' : ''}
              />
              {errors.khatauni_number && <span className="error-text">{errors.khatauni_number}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="land_area">Land Area (in acres)</label>
              <input
                id="land_area"
                name="land_area"
                type="number"
                min="0"
                value={formData.land_area}
                onChange={handleInputChange}
                placeholder="Enter land area"
                className={errors.land_area ? 'error' : ''}
              />
              {errors.land_area && <span className="error-text">{errors.land_area}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="irrigation_type">Irrigation Type</label>
              <select
                id="irrigation_type"
                name="irrigation_type"
                value={formData.irrigation_type}
                onChange={handleInputChange}
                className={errors.irrigation_type ? 'error' : ''}
              >
                <option value="">Select irrigation type</option>
                {irrigationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.irrigation_type && <span className="error-text">{errors.irrigation_type}</span>}
            </div>
            <div className="form-group">
              <label>Lease Status</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="lease_status"
                    value="yes"
                    checked={formData.lease_status === 'yes'}
                    onChange={handleInputChange}
                  />
                  {' '}Yes
                </label>
                <label style={{ fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="lease_status"
                    value="no"
                    checked={formData.lease_status === 'no'}
                    onChange={handleInputChange}
                  />
                  {' '}No
                </label>
              </div>
              {errors.lease_status && <span className="error-text">{errors.lease_status}</span>}
            </div>
            {formData.lease_status === 'yes' && (
              <div className="form-group">
                <label htmlFor="lease_duration">Lease Duration (months)</label>
                <input
                  id="lease_duration"
                  name="lease_duration"
                  type="number"
                  min="0"
                  value={formData.lease_duration}
                  onChange={handleInputChange}
                  placeholder="Enter lease duration"
                  className={errors.lease_duration ? 'error' : ''}
                />
                {errors.lease_duration && <span className="error-text">{errors.lease_duration}</span>}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#024b37' }}>Crops</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
              {cropOptions.map((crop) => (
                <label key={crop} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
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
          </div>

          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#024b37' }}>Bank Details</h3>
            <div className="form-group">
              <label htmlFor="bank_name">Bank Name</label>
              <input
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                placeholder="Enter bank name"
                className={errors.bank_name ? 'error' : ''}
              />
              {errors.bank_name && <span className="error-text">{errors.bank_name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="account_number">Account Number</label>
              <input
                id="account_number"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                placeholder="Enter account number"
                className={errors.account_number ? 'error' : ''}
              />
              {errors.account_number && <span className="error-text">{errors.account_number}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ifsc">IFSC Code</label>
              <input
                id="ifsc"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleInputChange}
                placeholder="Enter IFSC code"
                className={errors.ifsc ? 'error' : ''}
              />
              {errors.ifsc && <span className="error-text">{errors.ifsc}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="account_holder_name">Account Holder Name</label>
              <input
                id="account_holder_name"
                name="account_holder_name"
                value={formData.account_holder_name}
                onChange={handleInputChange}
                placeholder="Enter account holder name"
                className={errors.account_holder_name ? 'error' : ''}
              />
              {errors.account_holder_name && <span className="error-text">{errors.account_holder_name}</span>}
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              id="declaration"
              name="declaration"
              type="checkbox"
              checked={formData.declaration}
              onChange={handleInputChange}
            />
            <label htmlFor="declaration" style={{ fontWeight: 600 }}>
              I agree to the declaration and confirm the information is correct.
            </label>
          </div>
          {errors.declaration && <span className="error-text">{errors.declaration}</span>}

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? 'Registering Farmer...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterFarmer;
