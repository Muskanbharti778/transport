const development = {
  name: 'development',
  apiBaseUrl: 'http://vahanbook.com/Mobileapp/api',
  apiTimeoutMs: 15000,
};

const production = {
  name: 'production',
  apiBaseUrl: 'http://vahanbook.com/Mobileapp/api',
  apiTimeoutMs: 15000,
};

export const env = __DEV__ ? development : production;

