import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9WfFBFvL10zlpr2LrdgXkUHyss58oslE",
  authDomain: "ktechmm-af1d3.firebaseapp.com",
  projectId: "ktechmm-af1d3",
  storageBucket: "ktechmm-af1d3.firebasestorage.app",
  messagingSenderId: "454115710963",
  appId: "1:454115710963:web:c2892cd34d1490a9caa486",
  measurementId: "G-9WV7PPLZS8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);