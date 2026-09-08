import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@transportapp/session';

let volatileSession = null;

export const authStorage = {
  async getSession() {
    if (volatileSession) {
      return volatileSession;
    }
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      volatileSession = parsed;
      return parsed;
    } catch {
      // Ignore read errors; treat as no session.
      return null;
    }
  },
  async setSession(session) {
    volatileSession = session;
    try {
      const raw = session ? JSON.stringify(session) : null;
      if (raw) {
        await AsyncStorage.setItem(SESSION_KEY, raw);
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore write errors; volatile cache still holds the session.
    }
  },
  async clearSession() {
    volatileSession = null;
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore remove errors.
    }
  },
};
