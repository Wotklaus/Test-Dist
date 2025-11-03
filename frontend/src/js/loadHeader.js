document.addEventListener("DOMContentLoaded", () => {
  fetch("components/header-bar.html")
    .then(resp => resp.text())
    .then(html => {
      document.getElementById("main-header").innerHTML = html;

      // Ahora los eventos se agregan aquí, ¡después de insertar el header!
      const favBtn = document.getElementById("favorites-btn");
      if (favBtn) {
        favBtn.addEventListener("click", function() {
          window.location.href = "favorites.html";
        });
      }

      const articlesBtn = document.getElementById("articles-btn");
      if (articlesBtn) {
        articlesBtn.addEventListener("click", function() {
          window.location.href = "articles.html";
        });
      }

      const statsBtn = document.getElementById("statistics-btn");
      if (statsBtn) {
        statsBtn.addEventListener("click", function() {
          window.location.href = "statistics.html";
        });
      }

      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
          // Elimina el token y datos de sesión
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userEmail");
          window.location.href = "login.html";
        });
      }
    });
});