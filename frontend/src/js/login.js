import { loginUser } from './api.js';

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  // Limpia el mensaje de error cuando el usuario escribe en los campos
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

    const result = await loginUser(email, password);

    if (result.error) {
      document.getElementById("login-message").textContent = result.error || "Login failed";
      document.getElementById("login-message").style.color = "red";
      return;
    }

    // Guarda el token y los datos en localStorage
    localStorage.setItem("token", result.token); 
    localStorage.setItem("userId", result.user.id);
    localStorage.setItem("userEmail", result.user.email);

    // Redirige al index
    window.location.href = "index.html";
  });
});