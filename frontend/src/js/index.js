document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    window.location.href = "login.html";
    return;
  }

  const container = document.getElementById("pokemon-list");
  const searchInput = document.getElementById("search");
  let pokemons = [];
  let favorites = [];
  let currentPage = 1;
  const PAGE_SIZE = 8;
  let filteredList = [];

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  const favoritesBtn = document.getElementById("favorites-btn");
  if (favoritesBtn) {
    favoritesBtn.addEventListener("click", function () {
      window.location.href = "favorites.html";
    });
  }

  function renderPokemons(list) {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = "<p>No Pokémon found</p>";
      updateArrows(0);
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
        toggleFavorite(pokemon, favBtn);
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

    updateArrows(list.length);
  }

  function updateArrows(total) {
    const pageCount = Math.ceil(total / PAGE_SIZE);
    if (prevBtn) prevBtn.disabled = (currentPage === 1 || pageCount === 0);
    if (nextBtn) nextBtn.disabled = (currentPage === pageCount || pageCount === 0);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderPokemons(filteredList.length ? filteredList : pokemons);
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      const totalList = filteredList.length ? filteredList : pokemons;
      const maxPage = Math.ceil(totalList.length / PAGE_SIZE);
      if (currentPage < maxPage) {
        currentPage++;
        renderPokemons(totalList);
      }
    });
  }

  async function toggleFavorite(pokemon, btn) {
    const isFavorited = btn.classList.contains('favorited');
    if (!token) {
      alert("Please log in.");
      return;
    }

    try {
      let response;
      if (isFavorited) {
        response = await fetch("http://localhost:3000/api/favorites", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ pokemon_id: pokemon.id })
        });
      } else {
        response = await fetch("http://localhost:3000/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ pokemon_id: pokemon.id, pokemon_name: pokemon.name })
        });
      }

      if (response.ok) {
        if (isFavorited) {
          favorites = favorites.filter(name => name !== pokemon.name);
          btn.classList.remove('favorited');
          btn.innerHTML = "🤍";
        } else {
          favorites.push(pokemon.name);
          btn.classList.add('favorited');
          btn.innerHTML = "❤️";
        }
      } else {
        const errorData = await response.json();
        alert("Error updating favorites: " + (errorData.error || ""));
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  }

  async function loadFavorites() {
    try {
      const response = await fetch("http://localhost:3000/api/favorites", {
        headers: { "Authorization": "Bearer " + token }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.favorites || []).map(fav => fav.pokemon_name);
    } catch (error) {
      return [];
    }
  }

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
            id: info.id
          }))
      );
      Promise.all(promises).then(async results => {
        pokemons = results;
        favorites = await loadFavorites();
        filteredList = [];
        renderPokemons(pokemons);
      });
    })
    .catch(error => {
      container.textContent = "Error loading Pokémon";
      console.error(error);
    });

  // --- SEARCH BAR ---
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn && searchInput) {
    // Búsqueda por debounce cuando el usuario deja de escribir
    searchInput.addEventListener("input", _.debounce(function () {
      const filter = searchInput.value.trim().toLowerCase();
      filteredList = pokemons.filter(p => p.name.includes(filter));
      currentPage = 1;
      renderPokemons(filteredList.length ? filteredList : pokemons);

      if (filter && userId) {
        fetch("http://localhost:3000/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            pokemon_name: filter
          })
        }).catch(error => console.error("Error saving search:", error));
      }
    }, 400));

    // Búsqueda inmediata al presionar Enter
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const filter = searchInput.value.trim().toLowerCase();
        filteredList = pokemons.filter(p => p.name.includes(filter));
        currentPage = 1;
        renderPokemons(filteredList.length ? filteredList : pokemons);

        if (filter && userId) {
          fetch("http://localhost:3000/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              pokemon_name: filter
            })
          }).catch(error => console.error("Error saving search:", error));
        }
      }
    });

    // Búsqueda con throttle en el botón de la lupa + bloqueo del botón
    searchBtn.addEventListener("click", _.throttle(function () {
      searchBtn.disabled = true; // BLOQUEA el botón

      const filter = searchInput.value.trim().toLowerCase();
      filteredList = pokemons.filter(p => p.name.includes(filter));
      currentPage = 1;
      renderPokemons(filteredList.length ? filteredList : pokemons);

      if (filter && userId) {
        fetch("http://localhost:3000/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            pokemon_name: filter
          })
        }).catch(error => console.error("Error saving search:", error));
      }

      setTimeout(() => {
        searchBtn.disabled = false; // DESBLOQUEA el botón tras 3 segundos
      }, 3000);
    }, 3000)); // SOLO ejecuta búsqueda cada 3 segundos aunque hagan spam click
  }

  const articlesBtn = document.getElementById("articles-btn");
  if (articlesBtn) {
    articlesBtn.addEventListener("click", function () {
      window.location.href = "articles.html";
    });
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
});