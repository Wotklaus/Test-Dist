document.addEventListener("DOMContentLoaded", async () => {
  const headerContainer = document.getElementById("main-header");

  try {
    const resp = await fetch("components/header-bar.html");
    const html = await resp.text();
    headerContainer.innerHTML = html;

    // Get user role from localStorage (non-sensitive data)
    const userRole = localStorage.getItem("userRole");
    console.log("Role detected:", userRole);

    // Button references
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

    // Show/hide based on role
    if (userRole === "1") {
      // ADMIN → Only "Manage" buttons
      adminButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "inline-block";
      });
      
      // HIDE normal user buttons
      userButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "none";
      });
      
    } else {
      // NORMAL USER → Only normal buttons
      userButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "inline-block";
      });
      
      // HIDE admin buttons
      adminButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "none";
      });
    }

    // Assign navigation to buttons
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

    // UPDATED: Logout with HTTP-Only cookie clearing
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          console.log("Logout initiated - clearing session...");
          
          // NEW: Call logout endpoint to clear HTTP-Only cookies on server
          await fetch(`${window.location.origin}/api/logout`, {
            method: 'POST',
            credentials: 'include' // Important: to send cookies for clearing
          });
          
          console.log("Server cookies cleared successfully");
        } catch (error) {
          console.log("Server logout error (proceeding anyway):", error.message);
        }
        
        // Clear local user data
        localStorage.clear();
        console.log("Local storage cleared");
        
        // Redirect to login
        window.location.href = "login.html";
      });
    }
  } catch (error) {
    console.error("Error loading header:", error);
  }
});