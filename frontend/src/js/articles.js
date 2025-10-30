document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById('articles-list');
  container.textContent = "Loading articles...";

  // Llama al fetch para obtener los artículos
  const articles = await fetchArticlesWithAssets();
  if (!articles || articles.length === 0) {
    container.textContent = "No articles found";
    return;
  }

  container.innerHTML = "";
  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = "article-card";
    card.innerHTML = `
      <div class="article-img-area">
        ${article.image ? `<img src="${article.image}" alt="Article image" class="article-img"/>` : ""}
      </div>
      <div class="article-info">
        <h2 class="article-title">${article.title}</h2>
        <p class="article-content">${article.content}</p>
        <div class="article-meta">
          Autor: ${article.author} | Fecha: ${article.date}<br>
          Pokémon relacionados: ${article.relatedPokemon}
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Sidebar de otros artículos (puedes filtrar para no repetir el actual)
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