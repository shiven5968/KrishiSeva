import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAKA0aYELgi7U4lNy8qPdsKU4Id6pYCiSM",
  authDomain: "krishiseva-95318.firebaseapp.com",
  projectId: "krishiseva-95318",
  storageBucket: "krishiseva-95318.firebasestorage.app",
  messagingSenderId: "99454088088"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
