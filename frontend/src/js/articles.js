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
      <h2>${article.title}</h2>
      ${article.image ? `<img src="${article.image}" alt="Article image" style="max-width:300px;"/>` : ""}
      <p>${article.content}</p>
      <small>Author: ${article.author} | Date: ${article.date}</small>
      <small>Pokémon relacionados: ${article.relatedPokemon}</small>
    `;
    container.appendChild(card);
  });
});