// Firebase Messaging Service Worker — handles background push notifications
// Must stay at public/firebase-messaging-sw.js so it's served from the root /

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyApQPvpYkKMGtvSyK7Vdp1t2WAs9tpXXIw',
  authDomain:        'howaya-hr-c80e7.firebaseapp.com',
  projectId:         'howaya-hr-c80e7',
  storageBucket:     'howaya-hr-c80e7.firebasestorage.app',
  messagingSenderId: '1067066414856',
  appId:             '1:1067066414856:web:5eb4d4306ab30ebf61bebd',
});

// Force this SW version to take control immediately instead of waiting for
// every tab to close — this file's Firebase config has changed several
// times; without this, a browser can keep an old worker (old project/keys)
// active indefinitely and silently miss/misroute pushes.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

const messaging = firebase.messaging();

// Show notification when app is in background / closed
messaging.onBackgroundMessage(payload => {
  // TEMP debug aid — check DevTools → Application → Service Workers →
  // click "inspect" next to this worker to see this log (it does NOT show
  // in the regular page Console). Remove once realtime is confirmed stable.
  console.log('[FCM SW] background message received', payload);

  const title = payload.notification?.title ?? payload.data?.title ?? 'Howaya HR';
  const body  = payload.notification?.body  ?? payload.data?.body  ?? '';

  // Both steps are returned together (not fire-and-forget) so the browser
  // doesn't kill the worker mid-flight after showNotification() resolves —
  // that would let the OS toast show while silently dropping the postMessage
  // below before it reaches any open tab.
  return Promise.all([
    self.registration.showNotification(title, {
      body,
      icon:  '/vite.svg',
      badge: '/vite.svg',
      data:  payload.data ?? {},
    }),
    // Tell any open dashboard tabs to refetch — they won't get this push via
    // the page's own onMessage() since it only fires for the focused tab.
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'FCM_BACKGROUND_MESSAGE', payload }));
    }),
  ]);
});
