import { registerUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      console.log("Registration attempt started");
      
      const result = await registerUser(data);

      if (result.error) {
        msg.textContent = result.error || "Registration failed";
        msg.style.color = "red";
        console.log("Registration failed:", result.error);
        return;
      }

      msg.textContent = "Registration successful! Please login with your credentials.";
      msg.style.color = "green";
      form.reset();
      
      console.log("Registration successful");
      
      // Optional: Redirect to login after successful registration
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000); // 2 second delay to show success message

    } catch (err) {
      msg.textContent = "Error: " + err.message;
      msg.style.color = "red";
      console.error("Registration error:", err);
    }
  });
});