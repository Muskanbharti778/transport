import {useState} from 'react';
import {authApi} from '../auth.api';

export function useSendMobileOtp() {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sendOtp = async mobileNumber => {
    setIsSending(true);
    setErrorMessage('');
    try {
      return await authApi.sendOtp(mobileNumber);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to send OTP.');
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {sendOtp, isSending, errorMessage};
}
