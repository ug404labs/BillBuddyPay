// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANfojV1ckx765BCj0Zh4EoZpCmtj-JDFI",
  authDomain: "mpeke-beta.firebaseapp.com",
  projectId: "mpeke-beta",
  storageBucket: "mpeke-beta.appspot.com",
  messagingSenderId: "1017770358117",
  appId: "1:1017770358117:web:b2f4fde14437c688f6dd8c",
  measurementId: "G-N9BW237FJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
