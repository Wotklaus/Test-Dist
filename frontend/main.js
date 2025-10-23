console.log("Vanilla JS working :)");

// --- LOGIN PAGE LOGIC ---
if (window.location.pathname.endsWith("login.html")) {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("username", username);
          window.location.href = "index.html";
        } else {
          document.getElementById("login-message").textContent = data.message;
        }
      })
      .catch(() => {
        document.getElementById("login-message").textContent = "Server connection error";
      });
  });
}

// --- MAIN PAGE LOGIC ---
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  const container = document.getElementById("pokemon-list");
  const searchInput = document.getElementById("buscar");
  let pokemons = [];
  let favorites = [];
  const username = localStorage.getItem("username");

  let currentPage = 1;
  const PAGE_SIZE = 12;

  // Render Pokemon cards with pagination and favorite icon in card corner
  function renderPokemons(list) {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = "<p>No Pokémon found</p>";
      renderPagination(0);
      return;
    }
    // Pagination logic: render only current page's Pokémon
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageList = list.slice(start, end);

    pageList.forEach(pokemon => {
      const card = document.createElement("div");
      card.className = "poke-card";
      card.style.position = "relative"; // Ensure relative for absolute favorite

      // Favorite button in top-right corner
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

      // Pokemon image
      const img = document.createElement("img");
      img.src = pokemon.img;
      img.alt = pokemon.name;
      card.appendChild(img);

      // Pokemon name
      const name = document.createElement("div");
      name.className = "poke-name";
      name.textContent = pokemon.name;
      card.appendChild(name);

      // Pokemon type
      const pokeType = document.createElement("div");
      pokeType.className = "poke-type";
      pokeType.textContent = "Type: " + pokemon.type;
      card.appendChild(pokeType);

      container.appendChild(card);
    });

    // Render pagination bar below cards
    renderPagination(list.length);
  }

  // Pagination bar logic
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

  // Function to add/remove favorite
  function toggleFavorite(pokemonName, btn) {
    const isFavorited = btn.classList.contains('favorited');
    const method = isFavorited ? 'DELETE' : 'POST';
    fetch('/api/favorites', {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pokemon: pokemonName })
    })
      .then(res => res.json())
      .then(data => {
        favorites = data.favorites;
        btn.classList.toggle('favorited');
        btn.innerHTML = btn.classList.contains('favorited') ? "❤️" : "🤍";
      });
  }

  // Load first 30 Pokémon
  container.textContent = "Loading Pokémon...";
  fetch("https://pokeapi.co/api/v2/pokemon?limit=36")
    .then(response => response.json())
    .then(data => {
      // For each Pokémon, get its image and type
      const promises = data.results.map(pokemon =>
        fetch(pokemon.url)
          .then(res => res.json())
          .then(info => ({
            name: pokemon.name,
            img: info.sprites.front_default || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
            type: info.types.map(t => t.type.name).join(", ")
          }))
      );
      Promise.all(promises).then(results => {
        pokemons = results;
        // Get user's favorites before rendering
        fetch('/api/favorites?username=' + username)
          .then(res => res.json())
          .then(data => {
            favorites = data.favorites;
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

  // Search bar logic
  searchInput.addEventListener("input", function () {
    const filter = searchInput.value.toLowerCase();
    const filtered = pokemons.filter(p => p.name.includes(filter));
    // Reset to page 1 when searching!
    currentPage = 1;
    renderPokemons(filtered);
  });
}

// ---- LOGOUT ----
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("username");
      window.location.href = "login.html";
    });
  }
});