import {useState} from 'react';
import {authApi} from '../auth.api';

export function useVerifyMobileOtp() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const verifyOtp = async (mobileNumber, otp) => {
    setIsVerifying(true);
    setErrorMessage('');
    try {
      const result = await authApi.verifyOtp(mobileNumber, otp);
      return {verified: Boolean(result?.success), ...result};
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to verify OTP.');
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  return {verifyOtp, isVerifying, errorMessage};
}
