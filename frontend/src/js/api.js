export const API_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://test-dist.onrender.com";

// LOGGING FUNCTION with timestamps
function logWithTimestamp(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        refresh: '#9C27B0'
    };

    console.log(
        `%c[${timestamp}] ${message}`,
        `color: ${colors[type]}; font-weight: bold;`
    );
}

// NEW FUNCTION: Refresh token using HTTP-Only cookies
async function refreshToken() {
    try {
        logWithTimestamp("REFRESH PROCESS STARTED", 'refresh');
        logWithTimestamp("Sending refresh request using HTTP-Only cookies...", 'refresh');

        const startTime = Date.now();
        const response = await fetch(`${API_URL}/api/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include' // IMPORTANT: To send HTTP-Only cookies
        });
        const endTime = Date.now();

        logWithTimestamp(`Server response time: ${endTime - startTime}ms`, 'info');

        const data = await response.json();

        if (response.ok) {
            logWithTimestamp("NEW ACCESS TOKEN RECEIVED!", 'success');
            logWithTimestamp(`Token refreshed successfully: ${data.expiresIn}`, 'success');
            logWithTimestamp("New token automatically saved in HTTP-Only cookie", 'success');
            return true;
        } else {
            logWithTimestamp(`Refresh failed: ${data.error}`, 'error');
            if (data.requiresLogin) {
                logWithTimestamp("Refresh token expired - login required", 'error');
            }
            return false;
        }
    } catch (error) {
        logWithTimestamp(`Refresh network error: ${error.message}`, 'error');
        return false;
    }
}

// NEW FUNCTION: Make authenticated requests with auto-refresh using cookies
async function makeAuthenticatedRequest(url, options = {}) {
    const requestId = Math.random().toString(36).substring(7);
    logWithTimestamp(`[${requestId}] Starting authenticated request to: ${url}`, 'info');

    // Configure request with cookies
    const requestOptions = {
        ...options,
        credentials: 'include' // IMPORTANT: To send HTTP-Only cookies automatically
    };

    try {
        logWithTimestamp(`[${requestId}] Sending request with HTTP-Only cookies...`, 'info');

        // First attempt with current cookies
        let response = await fetch(url, requestOptions);

        logWithTimestamp(`[${requestId}] Response status: ${response.status} ${response.statusText}`,
            response.ok ? 'success' : 'warning');

        // If token expired (401 or 403), attempt refresh
        if (response.status === 401 || response.status === 403) {
            logWithTimestamp(`[${requestId}] TOKEN EXPIRED! Status: ${response.status}`, 'warning');
            logWithTimestamp(`[${requestId}] Initiating automatic token refresh...`, 'refresh');

            const refreshSuccess = await refreshToken();

            if (refreshSuccess) {
                logWithTimestamp(`[${requestId}] Token refreshed! Retrying original request...`, 'success');

                // Retry request (new token is already in cookies)
                response = await fetch(url, requestOptions);

                logWithTimestamp(`[${requestId}] Retry response status: ${response.status} ${response.statusText}`,
                    response.ok ? 'success' : 'error');

                if (response.ok) {
                    logWithTimestamp(`[${requestId}] REQUEST SUCCESSFUL AFTER TOKEN REFRESH!`, 'success');
                }
            } else {
                // Refresh failed, redirect to login
                logWithTimestamp(`[${requestId}] Refresh failed! Redirecting to login...`, 'error');
                localStorage.clear(); // Only clear user data, not tokens
                window.location.href = 'login.html';
                return { error: "Session expired", status: 401 };
            }
        } else if (response.ok) {
            logWithTimestamp(`[${requestId}] Request successful with current cookies`, 'success');
        }

        return response;
    } catch (error) {
        logWithTimestamp(`[${requestId}] Network error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Simplified monitor (no need to manually verify token expiration)
function startTokenMonitor() {
    logWithTimestamp("COOKIE MONITOR STARTED - Tokens managed by browser", 'info');
    logWithTimestamp("HTTP-Only cookies provide automatic token management", 'info');

    // Simplified monitor every 30 seconds to show status
    setInterval(() => {
        logWithTimestamp("Token status: Managed securely by HTTP-Only cookies", 'info');
    }, 30000);
}

// User login - UPDATED FOR COOKIES
export async function loginUser(email, password) {
    try {
        logWithTimestamp("LOGIN ATTEMPT STARTED", 'info');

        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include', // IMPORTANT: To receive HTTP-Only cookies
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            logWithTimestamp(`Login failed: ${data.error || "Login failed"}`, 'error');
            return { error: data.error || "Login failed" };
        }

        logWithTimestamp("LOGIN SUCCESSFUL!", 'success');
        logWithTimestamp("Tokens automatically saved in secure HTTP-Only cookies", 'success');
        logWithTimestamp("Access token: 2 minutes validity", 'success');
        logWithTimestamp("Refresh token: 7 days validity", 'success');

        // Start cookie monitor
        startTokenMonitor();

        return data;
    } catch (error) {
        logWithTimestamp(`Login network error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// User registration
export async function registerUser(data) {
    try {
        logWithTimestamp("REGISTRATION ATTEMPT", 'info');
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // For consistency
            body: JSON.stringify(data)
        });
        const result = await res.json();

        if (res.ok) {
            logWithTimestamp("Registration successful", 'success');
        } else {
            logWithTimestamp(`Registration failed: ${result.error}`, 'error');
        }

        return result;
    } catch (error) {
        logWithTimestamp(`Registration network error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Get user session - UPDATED
export function getSession() {
    // No longer verify tokens manually - HTTP-Only cookies handle it
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");

    if (!userId || !userEmail) {
        logWithTimestamp("No user session data found", 'warning');
        return null;
    }

    logWithTimestamp("User session data found", 'info');
    logWithTimestamp("Authentication handled by HTTP-Only cookies", 'info');

    return {
        userId,
        userEmail,
        userFirstName: localStorage.getItem("userFirstName"),
        userLastName: localStorage.getItem("userLastName"),
        userRole: localStorage.getItem("userRole")
    };
}

// Get favorites with auto-refresh
export async function getFavorites() {
    logWithTimestamp("GETTING FAVORITES", 'info');
    try {
        const response = await makeAuthenticatedRequest(`${API_URL}/api/favorites`, {
            method: 'GET'
        });

        if (response.error) {
            return response;
        }

        if (!response.ok) {
            return { error: "Failed to get favorites", status: response.status };
        }

        const data = await response.json();
        logWithTimestamp(`Favorites retrieved: ${data.length || 0} items`, 'success');
        return data;
    } catch (error) {
        logWithTimestamp(`Get favorites error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Add favorite with auto-refresh
export async function addFavorite(pokemonId, pokemonName) {
    logWithTimestamp(`ADDING FAVORITE: ${pokemonName} (ID: ${pokemonId})`, 'info');
    try {
        const response = await makeAuthenticatedRequest(`${API_URL}/api/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pokemon_id: pokemonId, pokemon_name: pokemonName })
        });

        if (response.error) {
            return response;
        }

        const data = await response.json();
        logWithTimestamp(`Favorite added successfully: ${pokemonName}`, 'success');
        return data;
    } catch (error) {
        logWithTimestamp(`Add favorite error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Remove favorite with auto-refresh
export async function removeFavorite(pokemonId) {
    logWithTimestamp(`REMOVING FAVORITE: ID ${pokemonId}`, 'info');
    try {
        const response = await makeAuthenticatedRequest(`${API_URL}/api/favorites`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pokemon_id: pokemonId })
        });

        if (response.error) {
            return response;
        }

        const data = await response.json();
        logWithTimestamp(`Favorite removed successfully: ID ${pokemonId}`, 'success');
        return data;
    } catch (error) {
        logWithTimestamp(`Remove favorite error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}