/**
 * Farmer registration form constants, validation, and payload mapping.
 */

export const blocksByDistrict = {
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

export const cropOptions = ["Mandua", "Jhangora", "Ramdana", "Kauni", "Cheena"];

export const initialFarmerFormData = {
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
};

const ifscPattern = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^\d{10}$/;

export function validateFarmerForm(formData) {
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
    validationErrors.cultivation_area = "Cultivation area must be greater than 0";
  }

  if (!formData.cultivation_khatauni.trim()) {
    validationErrors.cultivation_khatauni = "Khatauni account number is required";
  }

  if (!formData.cultivation_khasra.trim()) {
    validationErrors.cultivation_khasra = "Khasra number is required";
  }

  if (formData.lease_status === "yes") {
    if (!formData.lease_cultivator_name.trim()) {
      validationErrors.lease_cultivator_name = "Lease cultivator name is required";
    }
    if (!formData.lease_period.trim()) {
      validationErrors.lease_period = "Lease period is required";
    }
    if (!formData.lease_khatauni.trim()) {
      validationErrors.lease_khatauni = "Lease khatauni account number is required";
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
    validationErrors.estimated_seed_date = "Estimated seed sowing date is required";
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
    validationErrors.account_number = "Account number must contain only numbers";
  } else if (!/^\d{9,18}$/.test(formData.account_number.trim())) {
    validationErrors.account_number = "Account number must be between 9 and 18 digits";
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
}

export function formatFarmerPayload(formData) {
  return {
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
  };
}
