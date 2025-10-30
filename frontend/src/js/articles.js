document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById('articles-list');
  container.textContent = "Loading articles...";

  // Función para mostrar la fecha como "27 de febrero de 1996"
  function formatFecha(fechaIso) {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Trae los artículos desde Contentful
  const articles = await fetchArticlesWithAssets();
  if (!articles || articles.length === 0) {
    container.textContent = "No articles found";
    return;
  }

  container.innerHTML = "";
  articles.forEach(article => {
    // Estructura: imagen a la izquierda, info a la derecha
    const card = document.createElement('div');
    card.className = "article-card";
    card.innerHTML = `
      <div class="article-img-area">
        ${article.image ? `<img src="${article.image}" alt="Article image" class="article-img"/>` : ""}
      </div>
      <div class="article-info">
        <h2 class="article-title">${article.title || ""}</h2>
        <p class="article-content">${article.content || ""}</p>
        <div class="article-meta">
          ${article.author ? `${article.author}` : ""}
          ${article.date ? `<br>${formatFecha(article.date)}` : ""}
          ${article.relatedPokemon ? `<br>${article.relatedPokemon}` : ""}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Sidebar de otros artículos
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