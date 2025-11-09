// Helper to get the slug from the URL
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Date formatter
function formatFecha(fechaIso) {
  if (!fechaIso) return "";
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById('articles-list');
  container.textContent = "Loading article...";

  console.log("Loading articles from Contentful...");

  // Fetch articles from Contentful (already configured in your project)
  const articles = await fetchArticlesWithAssets(); // This function should bring the 3 published articles

  if (!articles || articles.length === 0) {
    console.log("No articles found in Contentful");
    container.textContent = "No articles found";
    return;
  }

  console.log("Articles loaded:", articles.length, "items");

  // Get slug from URL
  const slug = getQueryParam("slug");
  // Find article by slug, or default to first one (Satoshi Tajiri)
  let selectedArticle = articles[0];
  if (slug) {
    const found = articles.find(a => a.slug === slug);
    if (found) {
      selectedArticle = found;
      console.log("Article selected by slug:", slug);
    }
  }

  console.log("Displaying article:", selectedArticle.title);

  // Display only the selected article
  container.innerHTML = "";
  const card = document.createElement('div');
  card.className = "article-card";
  card.innerHTML = `
    <div class="article-img-area">
      ${selectedArticle.image ? `<img src="${selectedArticle.image}" alt="Article image" class="article-img"/>` : ""}
    </div>
    <div class="article-info">
      <h2 class="article-title">${selectedArticle.title || ""}</h2>
      <p class="article-content">${selectedArticle.content || ""}</p>
      <div class="article-meta">
        ${selectedArticle.author ? `${selectedArticle.author}` : ""}
        ${selectedArticle.date ? `<br>${formatFecha(selectedArticle.date)}` : ""}
        ${selectedArticle.relatedPokemon ? `<br>${selectedArticle.relatedPokemon}` : ""}
      </div>
    </div>
  `;
  container.appendChild(card);

  // Sidebar panel with links to the 3 articles
  const sidebarUl = document.getElementById('other-articles');
  if (sidebarUl) {
    sidebarUl.innerHTML = "";
    articles.forEach(article => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="articles.html?slug=${article.slug}">${article.title}</a>`;
      sidebarUl.appendChild(li);
    });
    console.log("Sidebar navigation created for", articles.length, "articles");
  }

  // Back button
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.onclick = function() {
      console.log("Navigating back to index");
      window.location.href = "index.html";
    };
  }

  // UPDATED: Logout button with HTTP-Only cookie clearing
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = async function() {
      try {
        console.log("Logout initiated from articles page");
        
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
    };
  }

  console.log("Articles page initialized successfully");
});