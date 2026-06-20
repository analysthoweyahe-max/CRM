const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const env = {
  apiBaseUrl: apiBaseUrl ?? '',
  appName:    import.meta.env.VITE_APP_NAME    ?? 'Howaya HR',
  isDev:      import.meta.env.DEV              as boolean,
  useMock:    !apiBaseUrl,
};
