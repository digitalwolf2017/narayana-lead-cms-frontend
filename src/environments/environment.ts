export const environment = {
  production: true,
  // Uses relative path so calls go through reverse-proxy / local proxy avoiding CORS
  apiBaseUrl: '/api/v1/backend',
  tokenStorageKey: 'auth_token',
};
