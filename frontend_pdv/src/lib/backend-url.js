const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return trimTrailingSlash(envApiUrl);
  }

  return `${window.location.protocol}//${window.location.hostname}:8080/api`;
};

export const getBackendBaseUrl = () => {
  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl.endsWith('/api')
    ? apiBaseUrl.slice(0, -4)
    : apiBaseUrl;
};

export const resolveBackendUrl = (value = '') => {
  if (!value) {
    return '';
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${getBackendBaseUrl()}${value}`;
  }

  return `${getBackendBaseUrl()}/${value}`;
};
