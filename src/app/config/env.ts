const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const env = {
  apiBaseUrl: apiBaseUrl ?? '',
  appName:    import.meta.env.VITE_APP_NAME    ?? 'Howaya HR',
  isDev:      import.meta.env.DEV              as boolean,
  useMock:    !apiBaseUrl,
  /** Optional Pusher key — enables Echo realtime for messages when set. */
  pusherKey:     (import.meta.env.VITE_PUSHER_APP_KEY as string | undefined) ?? '',
  pusherCluster: (import.meta.env.VITE_PUSHER_APP_CLUSTER as string | undefined) ?? 'mt1',
};
