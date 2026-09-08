const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ---- Email/password auth (mock) ----
// TODO(backend): replace both with real endpoints once the contract exists.

export const mockLogin = async ({email, password}) => {
  await delay(450);
  return {
    mode: 'mock_authenticated_session',
    email,
    onboarded: false,
  };
};

export const mockSignup = async ({username, email, password}) => {
  await delay(450);
  return {
    mode: 'mock_authenticated_session',
    email,
    username,
    onboarded: false,
  };
};

// ---- Mobile verification (mock) ----
// Used inside Business Setup only — this no longer creates or replaces the
// session; it just confirms a phone number, merged into the existing
// session by authStore.completeOnboarding().

export const mockSendMobileOtp = async ({mobileNumber}) => {
  await delay(450);
  return {mobileNumber, mode: 'mock_otp_sent'};
};

export const mockVerifyMobileOtp = async ({mobileNumber, otp}) => {
  await delay(450);
  // Mock always succeeds regardless of the digits entered — same behavior
  // as the original OtpScreen mock had.
  return {mobileNumber, verified: true};
};