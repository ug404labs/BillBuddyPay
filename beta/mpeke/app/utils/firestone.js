import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYhCUjB-Eg7CcA5mw-SZtQLR1V_vqrlmM",
    authDomain: "mpekedb.firebaseapp.com",
    projectId: "mpekedb",
    storageBucket: "mpekedb.appspot.com",
    messagingSenderId: "572979690749",
    appId: "1:572979690749:web:ac20ed1370b746451ed294",
    measurementId: "G-FBSCSQHVPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export default db;
