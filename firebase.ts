
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Berdasarkan screenshot bro, projectId adalah "beris-rider"
// Pastikan tidak ada "-operational" di belakangnya
const firebaseConfig = {
  apiKey: "AIzaSyDWqBXk9X3NJqJt0N_uIRxbP-DN3pgD0rM",
  authDomain: "beris-rider.firebaseapp.com",
  projectId: "beris-rider", 
  storageBucket: "beris-rider.firebasestorage.app",
  messagingSenderId: "1089881097916",
  appId: "1:1089881097916:web:dca98229c4281275aff2b9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
