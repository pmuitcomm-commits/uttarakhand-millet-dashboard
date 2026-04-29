export const LOGIN_METHODS = {
  PASSWORD: "password",
  OTP: "otp",
};

export const initialLoginFormData = {
  username: "",
  password: "",
  email: "",
  fullName: "",
  otpIdentifier: "",
  otpCode: "",
};

export const loginNotifications = [
  "Department notifications and scheme alerts will appear here.",
  "Live updates section is reserved for scrolling announcements.",
  "You can later connect this panel to API-based notices or MIS alerts.",
];

export function validatePasswordForm(formData) {
  const newErrors = {};

  if (!formData.username.trim()) {
    newErrors.username = "Username is required";
  }

  if (!formData.password.trim()) {
    newErrors.password = "Password is required";
  }

  return newErrors;
}

export function validateOtpIdentifier(formData) {
  const newErrors = {};

  if (!formData.otpIdentifier.trim()) {
    newErrors.otpIdentifier = "Username or mobile number is required";
  }

  return newErrors;
}

export function validateOtpForm(formData, otpRequested) {
  const newErrors = validateOtpIdentifier(formData);

  if (!otpRequested) {
    newErrors.otpIdentifier = "Please request an OTP before logging in";
  }

  if (!formData.otpCode.trim()) {
    newErrors.otpCode = "OTP is required";
  } else if (!/^\d{4,8}$/.test(formData.otpCode.trim())) {
    newErrors.otpCode = "Enter a valid OTP";
  }

  return newErrors;
}

export function validateLoginForm({ formData, isRegistering, loginMethod, otpRequested }) {
  if (isRegistering || loginMethod === LOGIN_METHODS.PASSWORD) {
    return validatePasswordForm(formData);
  }

  return validateOtpForm(formData, otpRequested);
}

export function normalizeAuthUser(user) {
  return {
    ...user,
    role: (user.role || "farmer").toLowerCase(),
  };
}

export function buildRegistrationPayload(formData) {
  return {
    username: formData.username,
    password: formData.password,
    email: formData.email,
    full_name: formData.fullName.trim() || null,
  };
}

export function getAuthErrorMessage(error) {
  return (
    error.response?.data?.detail ||
    error.message ||
    "Authentication failed. Please try again."
  );
}
