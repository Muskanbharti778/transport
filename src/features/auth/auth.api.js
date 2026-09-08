import {apiClient} from '../../services/api/client';

export const authApi = {
  login: async credentials => {
    const payload = {
      login: credentials.login || credentials.email || credentials.mobile,
      password: credentials.password,
    };
    console.log('[API:login] POSTING to', apiClient.defaults.baseURL, 'payload =', JSON.stringify(payload));
    let response;
    try {
      response = await apiClient.post('/login', payload);
    } catch (error) {
      console.log('[API:login] REQUEST FAILED. error =', JSON.stringify(error, null, 2));
      throw error;
    }
    console.log('[API:login] RESPONSE status =', response.status, '| body =', JSON.stringify(response.data));
    if (response.data?.status === false) {
      const firstErr = response.data.errors ? Object.values(response.data.errors)[0]?.[0] : null;
      console.log('[API:login] backend returned status:false. firstErr =', firstErr);
      throw new Error(firstErr || response.data.message || 'Login failed');
    }
    return response.data;
  },

  register: async payload => {
    const body = {
      username: payload.username || payload.name,
      email: payload.email,
      mobile: payload.mobile || payload.phone,
      password: payload.password,
    };
    const response = await apiClient.post('/register', body);
    if (response.data?.status === false) {
      const firstErr = response.data.errors ? Object.values(response.data.errors)[0]?.[0] : null;
      throw new Error(firstErr || response.data.message || 'Registration failed');
    }
    return response.data;
  },


  getCurrentUser: async (token = null) => {
    const config = token
      ? {headers: {Authorization: `Bearer ${token}`}}
      : undefined;
    const response = await apiClient.get('/user', config);
    return response.data;
  },

  sendOtp: async mobileNumber => {
    const response = await apiClient.post('/company/send-otp', {mobile: mobileNumber});
    return response.data;
  },

  verifyOtp: async (mobileNumber, otp) => {
    const response = await apiClient.post('/company/verify-otp', {
      mobile: mobileNumber,
      otp,
    });
    return response.data;
  },

  createCompany: async payload => {
    const response = await apiClient.post('/companies', payload);
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Unable to complete business setup');
    }
    return response.data;
  },
};


