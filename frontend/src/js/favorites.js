document.addEventListener("DOMContentLoaded", async function () {
  // VALIDACIÓN DE SESIÓN CON SUPABASE
  const { data, error } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }
  const userId = data.session.user.id;

  const favoritesList = document.getElementById("favorites-list");

  // Back to index
  document.getElementById("back-btn").addEventListener("click", function() {
    window.location.href = "index.html";
  });

  favoritesList.textContent = "Loading favorites...";

  // 1. Get favorites from Supabase
  async function loadFavorites() {
    const { data, error } = await supabase
      .from('favorites')
      .select('pokemon_id')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) {
      favoritesList.textContent = "You have no favorite Pokémon yet.";
      return [];
    }
    return data.map(fav => fav.pokemon_id);
  }

  // 2. Get full info from PokeAPI for each favorite
  async function loadFavoritePokemons(pokemonIds) {
    const promises = pokemonIds.map(id =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(info => {
          // Get evolutions
          return fetch(info.species.url)
            .then(res => res.json())
            .then(species => {
              if (species.evolution_chain) {
                return fetch(species.evolution_chain.url)
                  .then(res => res.json())
                  .then(chain => ({
                    name: capitalize(info.name),
                    img: info.sprites.front_default,
                    type: info.types.map(t => capitalize(t.type.name)).join(", "),
                    power: info.stats[1].base_stat, // Example: Attack
                    evolutions: getEvolutions(chain.chain),
                  }));
              } else {
                return {
                  name: capitalize(info.name),
                  img: info.sprites.front_default,
                  type: info.types.map(t => capitalize(t.type.name)).join(", "),
                  power: info.stats[1].base_stat,
                  evolutions: [],
                };
              }
            });
        })
    );
    return Promise.all(promises);
  }

  // Render all favorites
  async function renderFavorites() {
    const pokemonIds = await loadFavorites();
    if (pokemonIds.length === 0) return;

    const results = await loadFavoritePokemons(pokemonIds);
    favoritesList.innerHTML = "";
    results.forEach(pokemon => {
      const card = document.createElement("div");
      card.className = "poke-card";
      card.innerHTML = `
        <img src="${pokemon.img}" alt="${pokemon.name}">
        <div class="poke-name">${pokemon.name}</div>
        <div class="poke-type">Type: ${pokemon.type}</div>
        <div class="poke-power">Power: ${pokemon.power}</div>
        <div class="poke-evo">Evolutions: ${pokemon.evolutions.length ? pokemon.evolutions.map(capitalize).join(" → ") : "None"}</div>
      `;
      favoritesList.appendChild(card);
    });
  }

  // Helper to extract evolutions from chain
  function getEvolutions(chain) {
    const evo = [];
    let curr = chain;
    while (curr) {
      evo.push(curr.species.name);
      curr = curr.evolves_to && curr.evolves_to[0];
    }
    return evo;
  }

  // Capitalize first letter
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // INICIO
  renderFavorites();
});