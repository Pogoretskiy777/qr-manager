import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM elements
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const welcomeContainer = document.getElementById('welcome-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutButton = document.getElementById('logout-button');
const showSignupButton = document.getElementById('show-signup');
const showLoginButton = document.getElementById('show-login');
const errorMessage = document.getElementById('error-message');
const signupErrorMessage = document.getElementById('signup-error-message');
const userEmailSpan = document.getElementById('user-email');

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showWelcomeScreen(user.email);
    } else {
      showLoginScreen();
    }
  });
});

// Toggle between login and signup forms
showSignupButton.addEventListener('click', () => {
  loginContainer.classList.add('hidden');
  signupContainer.classList.remove('hidden');
  errorMessage.classList.add('hidden');
});

showLoginButton.addEventListener('click', () => {
  signupContainer.classList.add('hidden');
  loginContainer.classList.remove('hidden');
  signupErrorMessage.classList.add('hidden');
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
    errorMessage.classList.add('hidden');
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.classList.remove('hidden');
  }
});

// Handle signup form submission
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    signupErrorMessage.textContent = 'Passwords do not match';
    signupErrorMessage.classList.remove('hidden');
    return;
  }

  if (password.length < 6) {
    signupErrorMessage.textContent = 'Password must be at least 6 characters';
    signupErrorMessage.classList.remove('hidden');
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    signupForm.reset();
    signupErrorMessage.classList.add('hidden');
  } catch (error) {
    signupErrorMessage.textContent = error.message;
    signupErrorMessage.classList.remove('hidden');
  }
});

// Handle logout
logoutButton.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showLoginScreen();
    loginForm.reset();
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// UI display functions
function showLoginScreen() {
  loginContainer.classList.remove('hidden');
  signupContainer.classList.add('hidden');
  welcomeContainer.classList.add('hidden');
}

function showWelcomeScreen(email) {
  loginContainer.classList.add('hidden');
  signupContainer.classList.add('hidden');
  welcomeContainer.classList.remove('hidden');
  userEmailSpan.textContent = email;
}

// Export for use in other scripts
export { auth };
