import { getSession, getFavorites } from './api.js';

document.addEventListener("DOMContentLoaded", async function () {
  // Session validation using HTTP-Only cookies
  const session = getSession();
  if (!session) {
    console.log("No user session found - redirecting to login");
    window.location.href = "login.html";
    return;
  }

  console.log("User session validated for favorites page:", session.userEmail);

  const favoritesList = document.getElementById("favorites-list");
  favoritesList.textContent = "Loading favorites...";

  // Back button to return to index
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", function() {
      window.location.href = "index.html";
    });
  }

  // Request favorites - if session fails, redirect to login
  async function renderFavorites() {
    console.log("Fetching user favorites...");
    
    // UPDATED: Remove token parameter - API function handles HTTP-Only cookies
    const result = await getFavorites();

    // If authentication fails, redirect to login
    if (result.error && (result.status === 401 || result.status === 403)) {
      console.log("Authentication failed - redirecting to login");
      window.location.href = "login.html";
      return;
    }

    // Handle other errors
    if (result.error) {
      console.error("Error loading favorites:", result.error);
      favoritesList.textContent = "Error loading favorites. Please try again.";
      return;
    }

    // If no favorites, show message
    if (!result.favorites || result.favorites.length === 0) {
      console.log("No favorites found for user");
      favoritesList.textContent = "You have no favorite Pokémon yet.";
      return;
    }

    console.log("Favorites loaded:", result.favorites.length, "items");

    // Extract IDs and request visual details from PokéAPI
    const pokemonIds = result.favorites.map(fav => fav.pokemon_id);
    const pokemons = await loadFavoritePokemons(pokemonIds);

    // Render complete visual cards
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

    console.log("Favorites rendered successfully");
  }

  async function loadFavoritePokemons(pokemonIds) {
    console.log("Loading detailed Pokemon data for", pokemonIds.length, "favorites");
    
    // Request complete data from PokéAPI for each ID
    const promises = pokemonIds.map(id =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(res => {
          if (!res.ok) {
            console.warn(`Failed to load Pokemon ${id}`);
            return null;
          }
          return res.json();
        })
        .then(info => {
          if (!info) return null;
          
          return fetch(info.species.url)
            .then(res => res.json())
            .then(species => {
              if (species.evolution_chain) {
                return fetch(species.evolution_chain.url)
                  .then(res => res.json())
                  .then(chain => ({
                    name: capitalize(info.name),
                    img: info.sprites.front_default || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
                    type: info.types.map(t => capitalize(t.type.name)).join(", "),
                    power: info.stats[1].base_stat,
                    evolutions: getEvolutions(chain.chain),
                  }));
              } else {
                return {
                  name: capitalize(info.name),
                  img: info.sprites.front_default || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
                  type: info.types.map(t => capitalize(t.type.name)).join(", "),
                  power: info.stats[1].base_stat,
                  evolutions: [],
                };
              }
            })
            .catch(error => {
              console.warn(`Error loading species data for ${info.name}:`, error);
              return {
                name: capitalize(info.name),
                img: info.sprites.front_default || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
                type: info.types.map(t => capitalize(t.type.name)).join(", "),
                power: info.stats[1].base_stat,
                evolutions: [],
              };
            });
        })
        .catch(error => {
          console.warn(`Error loading Pokemon ${id}:`, error);
          return null;
        })
    );
    
    const results = await Promise.all(promises);
    const validPokemons = results.filter(pokemon => pokemon !== null);
    
    console.log("Pokemon details loaded:", validPokemons.length, "valid entries");
    return validPokemons;
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

  // Initialize favorites rendering
  try {
    await renderFavorites();
  } catch (error) {
    console.error("Error initializing favorites page:", error);
    favoritesList.textContent = "Error loading favorites. Please refresh the page.";
  }
});