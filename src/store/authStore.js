import {create} from 'zustand';
import {authStorage} from '../services/storage/authStorage';

export const useAuthStore = create((set, get) => ({
  isBootstrapping: true,
  isAuthenticated: false,
  isOnboarded: false,
  session: null,

  async restoreSession() {
    const session = await authStorage.getSession();
    set({
      session,
      isAuthenticated: Boolean(session),
      isOnboarded: Boolean(session?.onboarded),
      isBootstrapping: false,
    });
  },

  async setSession(session) {
    await authStorage.setSession(session);
    set({
      session,
      isAuthenticated: Boolean(session),
      isOnboarded: Boolean(session?.onboarded),
    });
  },

  async completeMockAuthentication(mockSession) {
    /*
     * Temporary UI-testing path only.
     * When the backend contract exists, auth hooks will call auth.api.js,
     * normalize the real response into a session (including a real
     * onboarded/profileComplete flag from the backend), then call
     * setSession(). RootNavigator observes isAuthenticated + isOnboarded
     * to decide between AuthNavigator, BusinessSetup, and AppNavigator.
     */
    await get().setSession(mockSession);
  },

  async completeOnboarding(profileFields = {}) {
    /*
     * Temporary mock path. In the real flow this will follow a successful
     * "submit business setup" API call, whose response confirms the
     * backend has marked the user/company as onboarded.
     */
    const currentSession = get().session;
    await get().setSession({
      ...currentSession,
      ...profileFields,
      onboarded: true,
    });
  },

  async logout() {
    await authStorage.clearSession();
    set({session: null, isAuthenticated: false, isOnboarded: false});
  },

  finishBootstrapping() {
    if (get().isBootstrapping) {
      set({isBootstrapping: false});
    }
  },
}));