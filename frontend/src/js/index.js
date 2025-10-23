console.log("Index JS working :)");

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("pokemon-list");
  const searchInput = document.getElementById("buscar");
  let pokemons = [];
  let favorites = [];
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  let currentPage = 1;
  const PAGE_SIZE = 12;

  function renderPokemons(list) {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = "<p>No Pokémon found</p>";
      renderPagination(0);
      return;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageList = list.slice(start, end);

    pageList.forEach(pokemon => {
      const card = document.createElement("div");
      card.className = "poke-card";
      card.style.position = "relative";

      const favBtn = document.createElement("button");
      favBtn.className = "favorite-btn-corner";
      favBtn.title = "Add to favorites";
      favBtn.innerHTML = favorites.includes(pokemon.name) ? "❤️" : "🤍";
      if (favorites.includes(pokemon.name)) {
        favBtn.classList.add("favorited");
      }
      favBtn.onclick = function () {
        toggleFavorite(pokemon.name, favBtn);
      };
      card.appendChild(favBtn);

      const img = document.createElement("img");
      img.src = pokemon.img;
      img.alt = pokemon.name;
      card.appendChild(img);

      const name = document.createElement("div");
      name.className = "poke-name";
      name.textContent = pokemon.name;
      card.appendChild(name);

      const pokeType = document.createElement("div");
      pokeType.className = "poke-type";
      pokeType.textContent = "Type: " + pokemon.type;
      card.appendChild(pokeType);

      container.appendChild(card);
    });

    renderPagination(list.length);
  }

  function renderPagination(total) {
    const pageCount = Math.ceil(total / PAGE_SIZE);
    const paginationBar = document.getElementById("pagination-bar");
    if (!paginationBar) return;

    if (pageCount <= 1) {
      paginationBar.innerHTML = "";
      return;
    }

    let paginationHTML = '';
    for (let i = 1; i <= pageCount; i++) {
      paginationHTML += `<button class="page-btn${i === currentPage ? " active" : ""}" data-page="${i}">${i}</button>`;
    }
    paginationBar.innerHTML = paginationHTML;
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.onclick = function() {
        currentPage = parseInt(this.getAttribute('data-page'));
        renderPokemons(pokemons);
      };
    });
  }

  // Modificado para enviar id y name
  function toggleFavorite(pokemonName, btn) {
    const isFavorited = btn.classList.contains('favorited');
    const method = isFavorited ? 'DELETE' : 'POST';

    // Busca el objeto Pokémon por nombre en el arreglo
    const pokemon = pokemons.find(p => p.name === pokemonName);

    fetch('/api/favorites', {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        pokemon_id: pokemon.id,        // Enviando el id
        pokemon_name: pokemon.name     // Enviando el nombre
      })
    })
      .then(res => res.json())
      .then(data => {
        // Actualiza favoritos como lista de nombres
        favorites = (data.favorites || []).map(fav => fav.pokemon_name);
        btn.classList.toggle('favorited');
        btn.innerHTML = btn.classList.contains('favorited') ? "❤️" : "🤍";
      });
  }

  // Load Pokémon (incluyendo id)
  container.textContent = "Loading Pokémon...";
  fetch("https://pokeapi.co/api/v2/pokemon?limit=36")
    .then(response => response.json())
    .then(data => {
      const promises = data.results.map(pokemon =>
        fetch(pokemon.url)
          .then(res => res.json())
          .then(info => ({
            name: pokemon.name,
            img: info.sprites.front_default || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
            type: info.types.map(t => t.type.name).join(", "),
            id: info.id // <--- Aquí agregamos el id
          }))
      );
      Promise.all(promises).then(results => {
        pokemons = results;
        fetch('/api/favorites', {
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(res => res.json())
          .then(data => {
            favorites = (data.favorites || []).map(fav => fav.pokemon_name);
            renderPokemons(pokemons);
          })
          .catch(() => {
            favorites = [];
            renderPokemons(pokemons);
          });
      });
    })
    .catch(error => {
      container.textContent = "Error loading Pokémon";
      console.error(error);
    });

  searchInput.addEventListener("input", function () {
    const filter = searchInput.value.toLowerCase();
    const filtered = pokemons.filter(p => p.name.includes(filter));
    currentPage = 1;
    renderPokemons(filtered);
  });

  // ---- LOGOUT ----
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      window.location.href = "login.html";
    });
  }
});