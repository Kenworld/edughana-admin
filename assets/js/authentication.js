import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const firebaseConfig = {
  apiKey: "AIzaSyDc7xbG23UV8JN-KKpsJydorSeNw6gaOwM",
  authDomain: "edughana-570cf.firebaseapp.com",
  projectId: "edughana-570cf",
  storageBucket: "edughana-570cf.firebasestorage.app",
  messagingSenderId: "587349854173",
  appId: "1:587349854173:web:79ee3e4f72b3a7d03bd834",
  measurementId: "G-TKH2JVMRBK",
};

async function fetchAndStoreUserData(user) {
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const userData = docSnap.data();
    localStorage.setItem("userData", JSON.stringify(userData));
    console.log("✅ User data stored in localStorage");
  } else {
    console.log("⚠️ User document not found in Firestore.");
  }
}
const loader = document.getElementById("loader");
if (loader) {
  loader.style.display = "none";
}

const signInButton = document.getElementById("loginbtn");
const email = document.getElementById("email");
const password = document.getElementById("password");
const feedback = document.getElementById("invalid-feedback");
//Allow user to sign in with email and password
//if (window.location.pathname === "index.html") {
//Get a reference to the elements
if (window.location.pathname.includes("index.html")) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      window.location.href = "dashboard.html";
    }
  });
  if (signInButton) {
    signInButton.addEventListener("click", () => {
      console.log("Logging in...");

      if (loader) loader.style.display = "block";

      if (validateEmail() && validatePassword()) {
        const emailVal = email.value.trim();
        const passwordVal = password.value;

        if (emailVal !== "" && passwordVal !== "") {
          signInWithEmailAndPassword(auth, emailVal, passwordVal)
            .then((userCredential) => {
              const user = userCredential.user;
              fetchAndStoreUserData(user); // Store the data
              window.location.href = "dashboard.html";
            })
            .catch((error) => {
              alert("Authentication failed: " + error.message);
              showError(error.message);
              if (loader) loader.style.display = "none";
            });
        }
      } else {
        if (loader) loader.style.display = "none";
      }
    });
  }
}
function validatePassword() {
  if (password.value.length < 6) {
    alert("Password must be at least 6 characters long");
    password.value = "";
    password.focus();
    return false;
  }
  return true;
}

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    alert("Please enter a valid email address");
    email.value = "";
    email.focus();
    return false;
  }
  return true;
}
//}

// Utility to show error
function showError(message) {
  if (feedback) {
    feedback.textContent = message;
    feedback.style.display = "block";
  }
}

if (!window.location.pathname.includes("index.html")) {
  const userNamePlaceholder = document.getElementById("userName");
  const loginLink = document.getElementById("accountLink");
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (userNamePlaceholder) {
        const displayName = user.displayName || user.email.split("@")[0];
        userNamePlaceholder.textContent = `Welcome back, ${displayName}`;
      }
      if (loginLink) {
        loginLink.setAttribute("href", "account.html");
      }
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        localStorage.setItem("userData", JSON.stringify(docSnap.data()));
        console.log("🔁 Refreshed user data in localStorage");
      }
      console.log("✅ User is logged in.");
    } else {
      if (userNamePlaceholder) {
        userNamePlaceholder.textContent = "Login / Sign Up";
      }
      if (loginLink) {
        loginLink.setAttribute("href", "login.html");
      }
      console.log("🚫 No user is logged in.");
    }
  });
}

// Admin authentication check
export async function checkAdminAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Only redirect if we're not on the index/login page
        if (
          !window.location.pathname.includes("index.html") &&
          !window.location.pathname.includes("login.html")
        ) {
          window.location.href = "/index.html";
        }
        reject("No user logged in");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if user belongs to edushop
          if (userData.appID !== "edushop") {
            if (
              !window.location.pathname.includes("index.html") &&
              !window.location.pathname.includes("login.html")
            ) {
              alert("Unauthorized access");
              window.location.href = "/index.html";
            }
            reject("Unauthorized access");
            return;
          }

          resolve(userData);
        } else {
          reject("User document not found");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        reject(error);
      } finally {
        // Unsubscribe from auth state changes
        unsubscribe();
      }
    });
  });
}

// Handle admin logout
export function handleAdminLogout() {
  const logoutBtn = document.getElementById("logoutbtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "/index.html";
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Error signing out");
      }
    });
  }
}

// Handle profile click
export function handleProfileClick() {
  const profileLink = document.querySelector(
    'a[href="#"][class="dropdown-item"]'
  );
  if (profileLink) {
    profileLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Add your profile page navigation logic here
      // window.location.href = "/profile.html";
    });
  }
}
