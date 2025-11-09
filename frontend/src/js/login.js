console.log("Login.js loaded"); // Load confirmation

import { loginUser } from './api.js';

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  // Clear error message when typing
  ["username", "password"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        document.getElementById("login-message").textContent = "";
      });
    }
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Perform login and receive user data
    const result = await loginUser(email, password);

    if (result.error) {
      document.getElementById("login-message").textContent = result.error || "Login failed";
      document.getElementById("login-message").style.color = "red";
      return;
    }

    // SAVE USER DATA ONLY (tokens are now in secure HTTP-Only cookies)
    // Adjusted for your backend: user data is in result.user and role is result.user.role_id
    // REMOVED: localStorage.setItem("token", result.token); - tokens now in HTTP-Only cookies
    localStorage.setItem("userId", result.user.id);
    localStorage.setItem("userEmail", result.user.email);
    localStorage.setItem("userFirstName", result.user.first_name);
    localStorage.setItem("userLastName", result.user.last_name);
    localStorage.setItem("userRole", String(result.user.role_id)); // Only this field, no assumptions

    console.log("Login successful - user data saved, tokens in secure cookies");
    console.log("Authentication tokens are now managed by HTTP-Only cookies");
    console.log("User will remain logged in with automatic token refresh");

    // Redirect to index.html
    window.location.href = "index.html";
  });
});