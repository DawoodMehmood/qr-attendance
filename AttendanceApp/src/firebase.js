// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth }       from "firebase/auth";  

const firebaseConfig = {
  apiKey: "AIzaSyCmZhqE_1SL7pKNlvGY1Yn4DyBBB2O_8J0",
  authDomain: "attendanceapp-e5da6.firebaseapp.com",
  projectId: "attendanceapp-e5da6",
  storageBucket: "attendanceapp-e5da6.firebasestorage.app",
  messagingSenderId: "524462889713",
  appId: "1:524462889713:web:768dfbfa5616d7b8c6e750"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db   = getFirestore(app);
