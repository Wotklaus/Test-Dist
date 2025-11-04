console.log("Login.js cargado"); // Confirmación de carga

import { loginUser } from './api.js';

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  // Limpia el mensaje de error al escribir
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

    // Hace el login y recibe el usuario
    const result = await loginUser(email, password);

    if (result.error) {
      document.getElementById("login-message").textContent = result.error || "Login failed";
      document.getElementById("login-message").style.color = "red";
      return;
    }

    // GUARDA TODOS LOS DATOS DEL USUARIO
    // Ajustado para tu backend: el usuario está en result.user y el rol es result.user.role_id
    localStorage.setItem("token", result.token);
    localStorage.setItem("userId", result.user.id);
    localStorage.setItem("userEmail", result.user.email);
    localStorage.setItem("userFirstName", result.user.first_name);
    localStorage.setItem("userLastName", result.user.last_name);
    localStorage.setItem("userRole", String(result.user.role_id)); // SOLO este campo, nada de suposiciones

    // Redirige a index.html
    window.location.href = "index.html";
  });
});