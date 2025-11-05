import { getSession } from './api.js';

document.addEventListener("DOMContentLoaded", async function () {
  // Session validation using HTTP-Only cookies
  const session = getSession();
  
  if (!session || !session.userId) {
    console.log("No user session found - redirecting to login");
    window.location.href = "login.html";
    return;
  }

  console.log("User session validated for statistics page:", session.userEmail);
  
  const tableBody = document.querySelector(".stat-table tbody");
  const chartCanvas = document.getElementById("searchPieChart");

  // Show loading state
  tableBody.innerHTML = `<tr><td colspan="2">Loading search history...</td></tr>`;

  try {
    console.log("Fetching search history for user:", session.userId);
    
    // Make request to backend using HTTP-Only cookies
    const res = await fetch(`http://localhost:3000/api/history/${session.userId}`, {
      credentials: 'include' // IMPORTANT: Send HTTP-Only cookies for authentication
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.log("Authentication failed - redirecting to login");
        window.location.href = "login.html";
        return;
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const result = await res.json();

    // Log backend response structure for debugging
    console.log("Backend response:", result);

    // Handle different response structures
    let history;
    if (Array.isArray(result)) {
      history = result;
    } else if ('history' in result) {
      history = result.history;
    } else {
      console.log("No history data found in response");
      tableBody.innerHTML = `<tr><td colspan="2">No search history found.</td></tr>`;
      return;
    }

    console.log("Search history loaded:", history.length, "entries");

    // Render HTML table
    tableBody.innerHTML = "";
    if (!history || history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="2">No search history found.</td></tr>`;
    } else {
      history.forEach(entry => {
        const searchDate = new Date(entry.searched_at || entry.timestamp || entry.date);
        const formattedDate = searchDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        tableBody.innerHTML += `
          <tr>
            <td>${entry.pokemon_name}</td>
            <td>${formattedDate}</td>
          </tr>
        `;
      });
      console.log("Search history table rendered successfully");
    }

    // Generate pie chart: count searches by Pokemon name
    const searchCounts = {};
    history.forEach(entry => {
      const name = entry.pokemon_name;
      searchCounts[name] = (searchCounts[name] || 0) + 1;
    });
    
    const labels = Object.keys(searchCounts);
    const dataChart = Object.values(searchCounts);

    console.log("Chart data prepared:", labels.length, "unique Pokemon");

    if (labels.length > 0) {
      // Create pie chart with Chart.js
      new Chart(chartCanvas.getContext('2d'), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: dataChart,
            backgroundColor: [
              '#6bb474', // Green
              '#f7d442', // Yellow
              '#fa7369', // Red
              '#3b86f5', // Blue
              '#b67fff', // Purple
              '#ffaa99', // Light Orange
              '#bbbbbb', // Gray
              '#50c878', // Emerald
              '#d3a625', // Gold
              '#ee7f2a'  // Orange
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                padding: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} searches (${percentage}%)`;
                }
              }
            }
          }
        }
      });
      console.log("Pie chart rendered successfully");
    } else {
      console.log("No data available for chart");
      // Optionally show a message where the chart would be
      const chartContainer = chartCanvas.parentElement;
      if (chartContainer) {
        chartContainer.innerHTML = '<p style="text-align: center; color: #666;">No data available for chart</p>';
      }
    }

  } catch (err) {
    console.error("Error loading search history:", err);
    tableBody.innerHTML = `<tr><td colspan="2">Error loading search history. Please try again.</td></tr>`;
    
    // If it's an authentication error, redirect to login
    if (err.message.includes('401') || err.message.includes('403')) {
      console.log("Authentication error detected - redirecting to login");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  }

  // Add back button functionality if exists
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", function() {
      console.log("Navigating back to index");
      window.location.href = "index.html";
    });
  }

  console.log("Statistics page initialized successfully");
});