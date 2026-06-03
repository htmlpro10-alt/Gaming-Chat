import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUU025lojKa1IDQjgUlxEZ_-SKOSCi27M",
  authDomain: "register-3adef.firebaseapp.com",
  projectId: "register-3adef",
  storageBucket: "register-3adef.firebasestorage.app",
  messagingSenderId: "84256309896",
  appId: "1:84256309896:web:bf160051758fd8f2bc153d"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get DOM Elements
const form = document.querySelector('form[name="form"]');
const usernameInput = document.querySelector('input[name="Username"]');
const emailInput = document.querySelector('input[name="Email"]');
const passwordInput = document.querySelector('input[name="Password"]');
const confirmPasswordInput = document.querySelector('input[name="Confirm-Password"]');
const errorDiv = document.getElementById("error-message");
const successDiv = document.getElementById("success-message");

// Show Error Message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  successDiv.style.display = "none";
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}

// Show Success Message
function showSuccess(message) {
  successDiv.textContent = message;
  successDiv.style.display = "block";
  errorDiv.style.display = "none";
}

// Validate Email Format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate Password Strength
function isStrongPassword(password) {
  return password.length >= 6;
}

// Handle Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Clear previous messages
  errorDiv.style.display = "none";
  successDiv.style.display = "none";

  // Validation
  if (!username) {
    showError("Username is required");
    return;
  }

  if (!email) {
    showError("Email is required");
    return;
  }

  if (!isValidEmail(email)) {
    showError("Please enter a valid email address");
    return;
  }

  if (!password) {
    showError("Password is required");
    return;
  }

  if (!isStrongPassword(password)) {
    showError("Password must be at least 6 characters long");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return;
  }

  try {
    // Show loading state
    const submitBtn = form.querySelector('input[type="submit"]');
    const originalValue = submitBtn.value;
    submitBtn.value = "Registering...";
    submitBtn.disabled = true;

    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with username
    await updateProfile(user, {
      displayName: username
    });

    // Save user data to Firestore
    await addDoc(collection(db, "UserAccounts"), {
      uid: user.uid,
      username: username,
      email: email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    // Show success message
    showSuccess("Account created successfully! Redirecting to login...");

    // Reset form
    form.reset();

    // Redirect to login page after 2 seconds
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

  } catch (error) {
    // Handle Firebase errors
    console.error("Registration error: ", error);

    if (error.code === "auth/email-already-in-use") {
      showError("Email is already in use. Please use a different email or login.");
    } else if (error.code === "auth/invalid-email") {
      showError("Invalid email address");
    } else if (error.code === "auth/weak-password") {
      showError("Password is too weak. Please use a stronger password.");
    } else if (error.code === "auth/operation-not-allowed") {
      showError("Registration is not allowed at this moment");
    } else if (error.code === "auth/network-request-failed") {
      showError("Network error. Please check your internet connection");
    } else {
      showError(error.message || "An error occurred during registration");
    }

    // Reset button state
    const submitBtn = form.querySelector('input[type="submit"]');
    submitBtn.value = "Submit";
    submitBtn.disabled = false;
  }
}); 
