document.addEventListener("DOMContentLoaded", async () => {
  const headerContainer = document.getElementById("main-header");

  try {
    const resp = await fetch("components/header-bar.html");
    const html = await resp.text();
    headerContainer.innerHTML = html;

    // 🔹 Obtenemos el rol
    const userRole = localStorage.getItem("userRole");
    console.log("Rol detectado:", userRole);

    // 🔹 Referencias a los botones
    const adminButtons = [
      "manage-roles-btn",
      "manage-users-btn",
      "manage-articles-btn", 
      "admin-statistics-btn"
    ];

    const userButtons = [
      "favorites-btn",
      "articles-btn",
      "statistics-btn"
    ];

    // 🔹 Mostrar/ocultar según el rol
    if (userRole === "1") {
      // ADMIN → Solo botones de "Manage"
      adminButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "inline-block";
      });
      
      // OCULTAR botones de usuario normal
      userButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "none";
      });
      
    } else {
      // USUARIO NORMAL → Solo botones normales
      userButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "inline-block";
      });
      
      // OCULTAR botones de admin
      adminButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "none";
      });
    }

    // 🔹 Asignar navegación a los botones (resto igual)
    const routes = {
      "favorites-btn": "favorites.html",
      "articles-btn": "articles.html", 
      "statistics-btn": "statistics.html",
      "manage-roles-btn": "manage_roles.html",
      "manage-users-btn": "manage_users.html",
      "manage-articles-btn": "manage_articles.html",
      "admin-statistics-btn": "admin_statistics.html"
    };

    Object.entries(routes).forEach(([id, path]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => (window.location.href = path));
      }
    });

    // 🔹 Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
      });
    }
  } catch (error) {
    console.error("Error cargando el header:", error);
  }
});