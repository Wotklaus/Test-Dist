// Helper to get the slug from the URL
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Formateador de fecha
function formatFecha(fechaIso) {
  if (!fechaIso) return "";
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById('articles-list');
  container.textContent = "Loading article...";

  // Trae los artículos desde Contentful (ya configurado en tu proyecto)
  const articles = await fetchArticlesWithAssets(); // <-- Esta función debe traerte los 3 artículos publicados

  if (!articles || articles.length === 0) {
    container.textContent = "No articles found";
    return;
  }

  // Obtén el slug de la URL
  const slug = getQueryParam("slug");
  // Busca el artículo por el slug, o por defecto el primero (Satoshi Tajiri)
  let selectedArticle = articles[0];
  if (slug) {
    const found = articles.find(a => a.slug === slug);
    if (found) selectedArticle = found;
  }

  // Muestra solo el artículo seleccionado
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

  // Panel lateral con links a los 3 artículos
  const sidebarUl = document.getElementById('other-articles');
  sidebarUl.innerHTML = "";
  articles.forEach(article => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="articles.html?slug=${article.slug}">${article.title}</a>`;
    sidebarUl.appendChild(li);
  });

  // Botón de regreso
  document.getElementById("back-btn").onclick = function() {
    window.location.href = "index.html";
  };

  // Botón de logout
  document.getElementById("logout-btn").onclick = function() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  };
});