import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase (JS SDK) — shared between the Expo customer app and the web owner panel.
 *
 * NOTE: This web config is safe to ship in a client bundle; Firebase protects your
 * data through Security Rules, not by hiding these values. Set restrictive rules
 * in the Firebase console (e.g. owners can write config, customers can only read).
 */
const firebaseConfig = {
  apiKey: 'AIzaSyAS3Bx5SmVOrFKiwMff7420zjv_04Y3xjA',
  authDomain: 'tapslip-40bd4.firebaseapp.com',
  projectId: 'tapslip-40bd4',
  storageBucket: 'tapslip-40bd4.firebasestorage.app',
  messagingSenderId: '781979882943',
  appId: '1:781979882943:web:7a70db618919fd140f3d0a',
  measurementId: 'G-GMK2N9S953',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
