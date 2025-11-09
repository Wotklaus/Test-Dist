import { getSession, getFavorites, addFavorite, removeFavorite } from './api.js';

document.addEventListener("DOMContentLoaded", async function () {
  // NEW: Check session using HTTP-Only cookies instead of localStorage tokens
  const session = getSession();
  
  if (!session) {
    console.log("No user session found - redirecting to login");
    window.location.href = "login.html";
    return;
  }

  console.log("User session validated:", session.userEmail);
  
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

  // UPDATED: Use API functions instead of raw fetch calls
  async function toggleFavorite(pokemon, btn) {
    const isFavorited = btn.classList.contains('favorited');
    
    try {
      let result;
      if (isFavorited) {
        console.log("Removing favorite:", pokemon.name);
        result = await removeFavorite(pokemon.id);
      } else {
        console.log("Adding favorite:", pokemon.name);
        result = await addFavorite(pokemon.id, pokemon.name);
      }

      if (result.error) {
        console.error("Favorite operation failed:", result.error);
        alert("Error updating favorites: " + result.error);
        return;
      }

      // Update UI on success
      if (isFavorited) {
        favorites = favorites.filter(name => name !== pokemon.name);
        btn.classList.remove('favorited');
        btn.innerHTML = "🤍";
        console.log("Favorite removed successfully");
      } else {
        favorites.push(pokemon.name);
        btn.classList.add('favorited');
        btn.innerHTML = "❤️";
        console.log("Favorite added successfully");
      }
    } catch (error) {
      console.error("Network error in toggleFavorite:", error);
      alert("Network error");
    }
  }

  // UPDATED: Use API function instead of raw fetch
  async function loadFavorites() {
    console.log("Loading user favorites...");
    try {
      const result = await getFavorites();
      
      if (result.error) {
        console.error("Failed to load favorites:", result.error);
        return [];
      }
      
      const favoriteNames = (result.favorites || result || []).map(fav => 
        fav.pokemon_name || fav.name
      );
      
      console.log("Favorites loaded:", favoriteNames.length, "items");
      return favoriteNames;
    } catch (error) {
      console.error("Error loading favorites:", error);
      return [];
    }
  }

  // Load Pokemon data
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
        console.log("Pokemon data loaded successfully");
      });
    })
    .catch(error => {
      container.textContent = "Error loading Pokémon";
      console.error("Error loading Pokemon:", error);
    });

  // UPDATED: Search functionality with HTTP-Only cookies
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn && searchInput) {
    
    // Debounced search on input
    searchInput.addEventListener("input", _.debounce(function () {
      const filter = searchInput.value.trim().toLowerCase();
      filteredList = pokemons.filter(p => p.name.includes(filter));
      currentPage = 1;
      renderPokemons(filteredList.length ? filteredList : pokemons);

      // Save search history with HTTP-Only cookies
      if (filter && session.userId) {
        fetch("http://localhost:3000/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // IMPORTANT: Send HTTP-Only cookies
          body: JSON.stringify({
            user_id: session.userId,
            pokemon_name: filter
          })
        }).catch(error => console.error("Error saving search:", error));
      }
    }, 400));

    // Immediate search on Enter key
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const filter = searchInput.value.trim().toLowerCase();
        filteredList = pokemons.filter(p => p.name.includes(filter));
        currentPage = 1;
        renderPokemons(filteredList.length ? filteredList : pokemons);

        if (filter && session.userId) {
          fetch("http://localhost:3000/api/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include', // IMPORTANT: Send HTTP-Only cookies
            body: JSON.stringify({
              user_id: session.userId,
              pokemon_name: filter
            })
          }).catch(error => console.error("Error saving search:", error));
        }
      }
    });

    // Throttled search on button click
    searchBtn.addEventListener("click", _.throttle(function () {
      searchBtn.disabled = true;

      const filter = searchInput.value.trim().toLowerCase();
      filteredList = pokemons.filter(p => p.name.includes(filter));
      currentPage = 1;
      renderPokemons(filteredList.length ? filteredList : pokemons);

      if (filter && session.userId) {
        fetch("http://localhost:3000/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include', // IMPORTANT: Send HTTP-Only cookies
          body: JSON.stringify({
            user_id: session.userId,
            pokemon_name: filter
          })
        }).catch(error => console.error("Error saving search:", error));
      }

      setTimeout(() => {
        searchBtn.disabled = false;
      }, 3000);
    }, 3000));
  }

  const articlesBtn = document.getElementById("articles-btn");
  if (articlesBtn) {
    articlesBtn.addEventListener("click", function () {
      window.location.href = "articles.html";
    });
  }

  // UPDATED: Logout functionality will be handled by loadHeader.js
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
      try {
        console.log("Logout initiated");
        
        // Call logout endpoint to clear HTTP-Only cookies
        await fetch("http://localhost:3000/api/logout", {
          method: 'POST',
          credentials: 'include'
        });
        
        console.log("Server cookies cleared");
      } catch (error) {
        console.log("Server logout error (proceeding anyway):", error.message);
      }
      
      localStorage.clear();
      console.log("Local storage cleared");
      window.location.href = "login.html";
    });
  }
});