console.log("Login JS working :)");

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  // Limpia mensaje cuando el usuario escribe
  ["username", "password"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        document.getElementById("login-message").textContent = "";
      });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userEmail", data.user.email);
          window.location.href = "index.html";
        } else {
          document.getElementById("login-message").textContent = data.error || "Login failed";
        }
      })
      .catch(() => {
        document.getElementById("login-message").textContent = "Server connection error";
      });
  });
});