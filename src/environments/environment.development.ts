export const environment = {
  production: false,
  // Uses relative path routed via proxy.conf.json to avoid CORS issues in local dev
  apiBaseUrl: '/api/v1/backend',
  tokenStorageKey: 'auth_token',
};
