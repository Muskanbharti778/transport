import {useState} from 'react';
import {mockRequestLoginOtp} from '../auth.mock';

export function useMockLoginRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const requestOtp = async mobileNumber => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      /*
       * Future flow:
       * requestLoginOtp() will live in src/features/auth/auth.api.js and will
       * use src/services/api/client.js. The backend contract will decide the
       * exact request body. For now the UI only captures mobileNumber and the
       * mock keeps that value inside navigation state for screen testing.
       */
      return await mockRequestLoginOtp({mobileNumber});
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to request OTP.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    requestOtp,
    isSubmitting,
    errorMessage,
  };
}
