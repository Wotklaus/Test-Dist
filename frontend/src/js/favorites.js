import { getSession, getFavorites } from './api.js';

document.addEventListener("DOMContentLoaded", async function () {
  // Validación del token en localStorage
  const session = getSession();
  if (!session || !session.token) {
    window.location.href = "login.html";
    return;
  }
  const token = session.token;

  const favoritesList = document.getElementById("favorites-list");
  favoritesList.textContent = "Loading favorites...";

  // Botón para volver al index
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "index.html";
    });
  }

  // Pide favoritos, si falla la sesión te manda al login
  async function renderFavorites() {
    const result = await getFavorites(token);

    // Si la autenticación falla, te manda al login
    if (result.error && (result.status === 401 || result.status === 403)) {
      window.location.href = "login.html";
      return;
    }

    // Si no hay favoritos, lo muestra
    if (!result.favorites || result.favorites.length === 0) {
      favoritesList.textContent = "You have no favorite Pokémon yet.";
      return;
    }

    // Saca los IDs y pide detalles visuales a la PokéAPI
    const pokemonIds = result.favorites.map(fav => fav.pokemon_id);
    const pokemons = await loadFavoritePokemons(pokemonIds);

    // Renderiza tarjetas visuales completas
    favoritesList.innerHTML = "";
    pokemons.forEach(pokemon => {
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

  async function loadFavoritePokemons(pokemonIds) {
    // Pide datos completos de la PokéAPI por cada ID
    const promises = pokemonIds.map(id =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => res.json())
        .then(info =>
          fetch(info.species.url)
            .then(res => res.json())
            .then(species => {
              if (species.evolution_chain) {
                return fetch(species.evolution_chain.url)
                  .then(res => res.json())
                  .then(chain => ({
                    name: capitalize(info.name),
                    img: info.sprites.front_default,
                    type: info.types.map(t => capitalize(t.type.name)).join(", "),
                    power: info.stats[1].base_stat,
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
            })
        )
    );
    return Promise.all(promises);
  }

  function getEvolutions(chain) {
    const evo = [];
    let curr = chain;
    while (curr) {
      evo.push(curr.species.name);
      curr = curr.evolves_to && curr.evolves_to[0];
    }
    return evo;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  renderFavorites();
});