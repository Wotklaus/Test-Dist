document.addEventListener("DOMContentLoaded", function () {
  const favoritesList = document.getElementById("favorites-list");
  const token = localStorage.getItem("token");

  // Back to index
  document.getElementById("back-btn").addEventListener("click", function() {
    window.location.href = "index.html";
  });

  favoritesList.textContent = "Loading favorites...";

  // 1. Get favorites from backend
  fetch("/api/favorites", {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(res => res.json())
    .then(data => {
      const favs = data.favorites || [];
      if (favs.length === 0) {
        favoritesList.textContent = "You have no favorite Pokémon yet.";
        return;
      }

      // 2. Get full info from PokeAPI for each favorite
      const promises = favs.map(fav =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${fav.pokemon_id}`)
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

      Promise.all(promises).then(results => {
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
      });
    });

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
});