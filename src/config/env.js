export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
  otp: import.meta.env.VITE_APP_OTP || '123456',
  otpResendSeconds: Number(import.meta.env.VITE_OTP_RESEND_SECONDS || 30),
};
