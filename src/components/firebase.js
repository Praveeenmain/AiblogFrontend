// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔐 Your Firebase project config (get this from your Firebase console)
const firebaseConfig = {
    apiKey: "AIzaSyDr8zhSpOpClVscHxuIdNqOjUMUknmFJmc",
    authDomain: "blogwebsite-84ead.firebaseapp.com",
    projectId: "blogwebsite-84ead",
    storageBucket: "blogwebsite-84ead.firebasestorage.app",
    messagingSenderId: "670093524431",
    appId: "1:670093524431:web:da1a7ae60f562144e266ba",
    measurementId: "G-F1N1V79QRD"
  };

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Initialize Auth
const auth = getAuth(app);

// 🌟 Export the initialized instances
export { auth };
