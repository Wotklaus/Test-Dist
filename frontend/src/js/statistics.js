document.addEventListener("DOMContentLoaded", async function () {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  
  if (!userId || !token) {
    window.location.href = "login.html";
    return;
  }

  const tableBody = document.querySelector(".stat-table tbody");
  const chartCanvas = document.getElementById("searchPieChart");

  try {
    // Hacemos la petición al backend usando userId dinámico
    const res = await fetch(`http://localhost:3000/api/history/${userId}`, {
      headers: { "Authorization": "Bearer " + token }
    });
    const result = await res.json();

    // LOG para ver la estructura del backend
    console.log("Respuesta del backend:", result);

    // --- Ajuste para estructura ---
    // Si tu DAO retorna un array simplemente
    let history;
    if (Array.isArray(result)) {
      history = result;
    } else if ('history' in result) {
      history = result.history;
    } else {
      // Si la respuesta no trae los datos, indicar error
      tableBody.innerHTML = `<tr><td colspan="2">No hay búsquedas registradas.</td></tr>`;
      return;
    }

    // Renderiza tabla HTML
    tableBody.innerHTML = "";
    if (!history || history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="2">No hay búsquedas registradas.</td></tr>`;
    } else {
      history.forEach(entry => {
        tableBody.innerHTML += `
          <tr>
            <td>${entry.pokemon_name}</td>
            <td>${new Date(entry.searched_at || entry.timestamp || entry.date).toLocaleString()}</td>
          </tr>
        `;
      });
    }

    // Para el gráfico Pie: contar búsquedas por nombre
    const searchCounts = {};
    history.forEach(entry => {
      const name = entry.pokemon_name;
      searchCounts[name] = (searchCounts[name] || 0) + 1;
    });
    const labels = Object.keys(searchCounts);
    const dataChart = Object.values(searchCounts);

    if (labels.length > 0) {
      new Chart(chartCanvas.getContext('2d'), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: dataChart,
            backgroundColor: [
              '#6bb474',
              '#f7d442',
              '#fa7369',
              '#3b86f5',
              '#b67fff',
              '#ffaa99',
              '#bbbbbb',
              '#50c878',
              '#d3a625',
              '#ee7f2a'
            ]
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }
      });
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="2">Error al cargar el historial.</td></tr>`;
    console.error(err);
  }
});