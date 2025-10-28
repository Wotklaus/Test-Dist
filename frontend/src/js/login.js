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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // LOGIN con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      document.getElementById("login-message").textContent = error.message || "Login failed";
      return;
    }

    // Guardar datos en localStorage
    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userEmail", data.user.email);

    window.location.href = "index.html";
  });
});