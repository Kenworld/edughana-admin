import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDc7xbG23UV8JN-KKpsJydorSeNw6gaOwM",
  authDomain: "edughana-570cf.firebaseapp.com",
  projectId: "edughana-570cf",
  storageBucket: "edughana-570cf.firebasestorage.app",
  messagingSenderId: "587349854173",
  appId: "1:587349854173:web:e38fe2af5ba40dd03bd834",
  measurementId: "G-YLZGJBM9GF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
