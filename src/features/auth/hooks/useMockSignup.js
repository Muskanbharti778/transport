import {useState} from 'react';
import {useAuthStore} from '../../../store/authStore';
import {authApi} from '../auth.api';
import {mockSignup} from '../auth.mock';

export function useMockSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const completeMockAuthentication = useAuthStore(state => state.completeMockAuthentication);

  const signup = async ({username, email, mobile, password}) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      let session;
      try {
        const res = await authApi.register({username, email, mobile, password});
        const token = res.data?.token || res.token || res.access_token;
        const user = res.data || res.user || {username, email, mobile};
        if (!token) {
          throw new Error(res.message || 'Registration failed');
        }
        // A freshly-registered user has no company yet, so they must complete
        // Business Setup before reaching the main app. companyid becomes set
        // once a company is registered.
        session = {
          accessToken: token,
          user: user,
          onboarded: Boolean(user.companyid),
        };
      } catch (apiError) {
        if (apiError.status || apiError.type === 'validation' || apiError.type === 'authentication') {
          setErrorMessage(apiError.message || 'Registration failed');
          return;
        }
        // Fallback to mock session if backend server is unreachable
        session = await mockSignup({username, email, mobile, password});
        session.onboarded = true;
      }
      await completeMockAuthentication(session);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to sign up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {signup, isSubmitting, errorMessage};
}
