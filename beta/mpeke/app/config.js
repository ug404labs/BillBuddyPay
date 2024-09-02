import { initializeApp } from "firebase/app";
import 'firebase/auth'
const firebaseConfig = {
    apiKey: "AIzaSyANfojV1ckx765BCj0Zh4EoZpCmtj-JDFI",
    authDomain: "mpeke-beta.firebaseapp.com",
    projectId: "mpeke-beta",
    storageBucket: "mpeke-beta.appspot.com",
    messagingSenderId: "1017770358117",
    appId: "1:1017770358117:web:b2f4fde14437c688f6dd8c",
    measurementId: "G-N9BW237FJ7"
  };
const app = initializeApp(firebaseConfig);
export {app}