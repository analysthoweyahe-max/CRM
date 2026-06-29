import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;
let messagingInit: Promise<Messaging | null> | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;
  firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  return firebaseApp;
}

export function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingInstance) return Promise.resolve(messagingInstance);
  if (!messagingInit) {
    messagingInit = isSupported()
      .then((supported) => {
        if (!supported) return null;
        messagingInstance = getMessaging(getFirebaseApp());
        return messagingInstance;
      })
      .catch(() => null);
  }
  return messagingInit;
}
