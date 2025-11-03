import { registerUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const result = await registerUser(data);

      if (result.error) {
        msg.textContent = result.error || "Registration failed";
        msg.style.color = "red";
        return;
      }

      msg.textContent = "Registration successful!";
      msg.style.color = "green";
      form.reset();
    } catch (err) {
      msg.textContent = "Error: " + err.message;
      msg.style.color = "red";
      console.error("Registration error:", err);
    }
  });
});