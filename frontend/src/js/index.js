console.log("Index JS working :)");

document.addEventListener("DOMContentLoaded", async function () {
  // VALIDACIÓN DE SESIÓN CON SUPABASE (redirección si no hay login)
  const { data, error } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }
  const userId = data.session.user.id;

  // --- FAVORITES BUTTON ---
  const favoritesBtn = document.getElementById("favorites-btn");
  if (favoritesBtn) {
    favoritesBtn.addEventListener("click", function () {
      window.location.href = "favorites.html";
    });
  }

  const container = document.getElementById("pokemon-list");
  const searchInput = document.getElementById("search");
  let pokemons = [];
  let favorites = [];
  let currentPage = 1;
  const PAGE_SIZE = 8;

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
      btn.onclick = function () {
        currentPage = parseInt(this.getAttribute('data-page'));
        renderPokemons(pokemons);
      };
    });
  }

  // Usar Supabase para favoritos
  async function toggleFavorite(pokemon, btn) {
    const isFavorited = btn.classList.contains('favorited');

    if (!userId) {
      alert("Please log in.");
      return;
    }

    if (isFavorited) {
      // QUITAR favorito
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('pokemon_id', pokemon.id);

      if (!error) {
        favorites = favorites.filter(name => name !== pokemon.name);
        btn.classList.remove('favorited');
        btn.innerHTML = "🤍";
      }
    } else {
      // AGREGAR favorito
      const { error } = await supabase
        .from('favorites')
        .insert([
          { user_id: userId, pokemon_id: pokemon.id, pokemon_name: pokemon.name }
        ]);

      if (!error) {
        favorites.push(pokemon.name);
        btn.classList.add('favorited');
        btn.innerHTML = "❤️";
      }
    }
  }

  // Cargar la lista de favoritos del usuario desde Supabase
  async function loadFavorites() {
    const { data, error } = await supabase
      .from('favorites')
      .select('pokemon_name')
      .eq('user_id', userId);

    if (error) return [];
    return (data || []).map(fav => fav.pokemon_name);
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
      Promise.all(promises).then(async results => {
        pokemons = results;
        favorites = await loadFavorites();
        renderPokemons(pokemons);
      });
    })
    .catch(error => {
      container.textContent = "Error loading Pokémon";
      console.error(error);
    });

  // --- SEARCH BAR ---
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const filter = searchInput.value.toLowerCase();
      const filtered = pokemons.filter(p => p.name.includes(filter));
      currentPage = 1;

      renderPokemons(filtered);
    });
  }

  const articlesBtn = document.getElementById("articles-btn");
  if (articlesBtn) {
    articlesBtn.addEventListener("click", function () {
      window.location.href = "articles.html";
    });
  }

  // ---- LOGOUT ----
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
      await supabase.auth.signOut();
      window.location.href = "login.html";
    });
  }



});