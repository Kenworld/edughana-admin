import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

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
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export { db, auth, storage };

const logoutbtn = document.getElementById("logoutbtn");

if (logoutbtn) {
  logoutbtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        localStorage.removeItem("userData");
        window.location.href = "index.html";
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
  });
}
function validatePassword(password) {
  if (password.value.length < 6) {
    alert("Password must be at least 6 characters long");
    password.value = "";
    password.focus();
    return false;
  }
  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    alert("Please enter a valid email address");
    email.value = "";
    email.focus();
    return false;
  }
  return true;
}
if (
  window.location.pathname.endsWith("/index.html") ||
  window.location.pathname.endsWith("/")
) {
  //Get a reference to the elements
  const signInButton = document.getElementById("loginBtn");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  if (signInButton) {
    signInButton.addEventListener("click", () => {
      if (validateEmail(email) && validatePassword(password)) {
        const emailVal = email.value.trim();
        const passwordVal = password.value;

        if (emailVal !== "" && passwordVal !== "") {
          signInWithEmailAndPassword(auth, emailVal, passwordVal)
            .then((userCredential) => {
              const user = userCredential.user;
              // Assuming fetchAndStoreUserData is available globally or imported elsewhere
              // If not, this will need to be addressed.
              // fetchAndStoreUserData(user);
              window.location.href = "dashboard.html";
            })
            .catch((error) => {
              alert("Authentication failed: " + error.message);
            });
        }
      }
    });
  }
}
