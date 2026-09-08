import {useState} from 'react';
import {useAuthStore} from '../../../store/authStore';
import {mockCompleteOtpAuthentication} from '../auth.mock';

export function useMockOtpVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const completeMockAuthentication = useAuthStore(
    state => state.completeMockAuthentication,
  );

  const verifyOtp = async mobileNumber => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      /*
       * Future flow:
       * verifyOtp() will call src/features/auth/auth.api.js. The backend
       * response will be normalized into a real session and stored through
       * authStore -> authStorage. RootNavigator already reacts to
       * isAuthenticated=true by switching from AuthNavigator to AppNavigator.
       */
      const mockSession = await mockCompleteOtpAuthentication({mobileNumber});
      await completeMockAuthentication(mockSession);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to verify OTP.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    verifyOtp,
    isSubmitting,
    errorMessage,
  };
}
