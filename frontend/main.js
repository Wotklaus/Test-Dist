// Este archivo manejará toda la lógica JS del frontend

console.log("Vanilla JS funcionando :)");

if (window.location.pathname.endsWith("login.html")) {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username === "admin" && password === "1234") {
      window.location.href = "index.html";
    } else {
      document.getElementById("login-message").textContent = "Usuario o contraseña incorrectos";
    }
  });
}

// --- Lógica para mostrar Pokémon y búsqueda ---
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  const container = document.getElementById("pokemon-list");
  const buscarInput = document.getElementById("buscar");
  let pokemons = [];

  // Función para renderizar cards
  function renderPokemons(list) {
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = "<p>No se encontraron Pokémon</p>";
      return;
    }
    list.forEach(pokemon => {
      const card = document.createElement("div");
      card.className = "poke-card";
      // Imagen oficial de PokéAPI
      const img = document.createElement("img");
      img.src = pokemon.img;
      img.alt = pokemon.name;
      card.appendChild(img);
      // Nombre
      const name = document.createElement("div");
      name.className = "poke-name";
      name.textContent = pokemon.name;
      card.appendChild(name);
      container.appendChild(card);
    });
  }

  // Carga los primeros 20 Pokémon
  container.textContent = "Cargando Pokémon...";
  fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
    .then(response => response.json())
    .then(data => {
      // Para cada Pokémon, obtenemos su imagen
      const promises = data.results.map(pokemon =>
        fetch(pokemon.url)
          .then(res => res.json())
          .then(info => ({
            name: pokemon.name,
            img: info.sprites.front_default || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"
          }))
      );
      // Esperamos a que se resuelvan todas las promesas
      Promise.all(promises).then(results => {
        pokemons = results;
        renderPokemons(pokemons);
      });
    })
    .catch(error => {
      container.textContent = "Error al cargar Pokémon";
      console.error(error);
    });

  // Barra de búsqueda
  buscarInput.addEventListener("input", function() {
    const filtro = buscarInput.value.toLowerCase();
    const filtrados = pokemons.filter(p => p.name.includes(filtro));
    renderPokemons(filtrados);
  });
}