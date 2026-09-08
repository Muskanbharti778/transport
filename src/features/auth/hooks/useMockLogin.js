import {useState} from 'react';
import {useAuthStore} from '../../../store/authStore';
import {authApi} from '../auth.api';
import {mockLogin} from '../auth.mock';

export function useMockLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const completeMockAuthentication = useAuthStore(state => state.completeMockAuthentication);

  const login = async ({emailOrMobile, email, password}) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      let session;
      try {
        const identifier = emailOrMobile || email;
        console.log('[LOGIN] calling authApi.login with identifier =', identifier);
        const res = await authApi.login({login: identifier, password});
        console.log('[LOGIN] authApi.login resolved. res =', JSON.stringify(res, null, 2));
        // Backend returns the envelope {status, message, data:{userid, username,
        // email, mobile, token}}, so the token and user fields live under
        // res.data.data. Reading res.data.token (one level shallow) produced an
        // undefined token that silently fell back to the mock, leaving the app
        // without a real token and every module empty.
        const payload = res.data || res;
        const fields = payload.data || payload;
        const token =
          fields.token || fields.access_token || payload.token || payload.access_token;
        const user = {
          userid: fields.userid,
          username: fields.username || fields.user?.username,
          email: fields.email || fields.user?.email,
          mobile: fields.mobile || fields.user?.mobile,
          companyid: fields.companyid ?? fields.user?.companyid,
          ...(fields.user || {}),
        };
        if (!token) {
          console.log('[LOGIN] TOKEN NOT FOUND. payload =', JSON.stringify(payload), '| fields =', JSON.stringify(fields));
          throw new Error(fields.message || payload.message || 'Invalid email/mobile or password');
        }
        console.log('[LOGIN] token extracted successfully, length =', token.length);
        // The login response does not include companyid, so fetch the current
        // user (GET /user returns the full user incl. companyid) to decide
        // whether Business Setup is still required. The token is passed
        // explicitly because the session (and its stored token) is not saved
        // until completeMockAuthentication runs below.
        let companyid = user.companyid;
        if (companyid == null) {
          try {
            const current = await authApi.getCurrentUser(token);
            const cu = current?.data || current;
            if (cu && cu.companyid != null) {
              companyid = cu.companyid;
              user.companyid = cu.companyid;
            }
          } catch {
            // Cannot reach /user; fall back to the login payload's flags.
          }
        }
        const onboarded = companyid != null;
        session = {
          accessToken: token,
          user: user,
          onboarded,
        };
      } catch (apiError) {
        console.log('[LOGIN] login API threw. apiError =', JSON.stringify(apiError, null, 2));
        if (apiError.status || apiError.type === 'validation' || apiError.type === 'authentication') {
          console.log('[LOGIN] showing error message to user:', apiError.message);
          setErrorMessage(apiError.message || 'Invalid email/mobile or password');
          return;
        }
        // Fallback to mock login if offline
        console.log('[LOGIN] falling back to MOCK login (no real token will be stored)');
        session = await mockLogin({email, password});
        session.onboarded = true;
      }
      await completeMockAuthentication(session);
      console.log('[LOGIN] session stored. accessToken present?', Boolean(session.accessToken), '| onboarded =', session.onboarded);
    } catch (error) {
      console.log('[LOGIN] outer catch. error =', error?.message);
      setErrorMessage(error?.message || 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {login, isSubmitting, errorMessage};
}
