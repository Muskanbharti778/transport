import axios from 'axios';
import {env} from '../../config/env';
import {authStorage} from '../storage/authStorage';
import {useAuthStore} from '../../store/authStore';
import {normalizeApiError} from './errors';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async config => {
  const session = await authStorage.getSession();
  const token = session?.accessToken;
  const masked = token ? `${token.slice(0, 8)}…${token.slice(-6)} (len ${token.length})` : 'none';
  console.log('[API] request', config.method?.toUpperCase(), config.baseURL + config.url, '| Bearer:', masked);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const AUTH_ENDPOINTS = ['/login', '/register'];

apiClient.interceptors.response.use(
  response => {
    console.log('[API] response', response.status, response.config?.method?.toUpperCase(), response.config?.url);
    return response;
  },
  error => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const sentToken = Boolean(error?.config?.headers?.Authorization);
    console.log(
      '[API] ERROR',
      status,
      error?.config?.method?.toUpperCase(),
      url,
      '| message:', error?.message,
    );

    // A 401 on a protected endpoint means the stored token is stale/invalid
    // (e.g. a session persisted in AsyncStorage from an older login, or the
    // token was revoked on the server). Without this the app would stay in an
    // authenticated but permanently-broken state — every list/update would
    // 401 and the user would have no way back to the login screen. Clear the
    // session so RootNavigator returns to auth. Login/register 401s (wrong
    // password, etc.) are the app's normal credential flow and are exempt.
    if (
      status === 401 &&
      sentToken &&
      !AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint)) &&
      useAuthStore.getState().isAuthenticated
    ) {
      console.log('[AUTH] 401 on protected endpoint — clearing stale session');
      useAuthStore.getState().logout();
    }

    return Promise.reject(normalizeApiError(error));
  },
);
