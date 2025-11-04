export const API_URL = 'http://localhost:3000';

// 🔥 FUNCIÓN DE LOGGING con timestamps
function logWithTimestamp(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('es-ES', {
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

// 🔥 FUNCIÓN: Verificar si token está próximo a expirar
function checkTokenExpiration() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
        // Decodificar JWT para ver cuándo expira
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = payload.exp;
        const timeLeft = expiresAt - now;
        
        logWithTimestamp(`🕒 Token expires in ${timeLeft} seconds`, 'info');
        
        if (timeLeft <= 30) {
            logWithTimestamp(`⚠️ Token expires in ${timeLeft} seconds - CRITICAL!`, 'warning');
        }
        
        return { timeLeft, expiresAt, expired: timeLeft <= 0 };
    } catch (error) {
        logWithTimestamp(`❌ Error checking token expiration: ${error.message}`, 'error');
        return null;
    }
}

// 🔥 FUNCIÓN: Renovar token automáticamente con logs detallados
async function refreshToken() {
    try {
        logWithTimestamp("🔄 REFRESH PROCESS STARTED", 'refresh');
        logWithTimestamp("📱 Checking for refresh token in localStorage...", 'refresh');
        
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!refreshToken) {
            logWithTimestamp("❌ No refresh token found in localStorage", 'error');
            return false;
        }
        
        logWithTimestamp("✅ Refresh token found, sending to server...", 'refresh');
        
        const startTime = Date.now();
        const response = await fetch(`${API_URL}/api/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });
        const endTime = Date.now();
        
        logWithTimestamp(`⏱️ Server response time: ${endTime - startTime}ms`, 'info');

        const data = await response.json();

        if (response.ok) {
            logWithTimestamp("🎉 NEW ACCESS TOKEN RECEIVED!", 'success');
            logWithTimestamp(`🔑 Old token: ${localStorage.getItem("token")?.substring(0, 20)}...`, 'info');
            
            localStorage.setItem("token", data.token);
            
            logWithTimestamp(`🔑 New token: ${data.token.substring(0, 20)}...`, 'success');
            logWithTimestamp(`⏰ New token expires in: ${data.expiresIn}`, 'success');
            
            // Verificar nuevo token
            checkTokenExpiration();
            
            return true;
        } else {
            logWithTimestamp(`❌ Refresh failed: ${data.error}`, 'error');
            return false;
        }
    } catch (error) {
        logWithTimestamp(`💥 Refresh network error: ${error.message}`, 'error');
        return false;
    }
}

// 🔥 FUNCIÓN: Hacer request con auto-refresh y logs detallados
async function makeAuthenticatedRequest(url, options = {}) {
    const requestId = Math.random().toString(36).substring(7);
    logWithTimestamp(`🚀 [${requestId}] Starting authenticated request to: ${url}`, 'info');
    
    // Verificar token antes de la request
    const tokenStatus = checkTokenExpiration();
    
    const token = localStorage.getItem("token");
    
    if (!token) {
        logWithTimestamp(`❌ [${requestId}] No authentication token found`, 'error');
        return { error: "No authentication token", status: 401 };
    }

    // Configurar headers con token
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    try {
        logWithTimestamp(`📤 [${requestId}] Sending request with current token...`, 'info');
        
        // Primer intento con token actual
        let response = await fetch(url, {
            ...options,
            headers
        });

        logWithTimestamp(`📥 [${requestId}] Response status: ${response.status} ${response.statusText}`, 
            response.ok ? 'success' : 'warning');

        // Si token expiró (401 o 403), intentar refresh
        if (response.status === 401 || response.status === 403) {
            logWithTimestamp(`🚨 [${requestId}] TOKEN EXPIRED! Status: ${response.status}`, 'warning');
            logWithTimestamp(`🔄 [${requestId}] Initiating automatic token refresh...`, 'refresh');
            
            const refreshSuccess = await refreshToken();
            
            if (refreshSuccess) {
                logWithTimestamp(`✅ [${requestId}] Token refreshed! Retrying original request...`, 'success');
                
                // Reintentar con nuevo token
                const newToken = localStorage.getItem("token");
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`
                    }
                });
                
                logWithTimestamp(`📥 [${requestId}] Retry response status: ${response.status} ${response.statusText}`, 
                    response.ok ? 'success' : 'error');
                
                if (response.ok) {
                    logWithTimestamp(`🎉 [${requestId}] REQUEST SUCCESSFUL AFTER TOKEN REFRESH!`, 'success');
                }
            } else {
                // Refresh falló, redirigir al login
                logWithTimestamp(`💀 [${requestId}] Refresh failed! Redirecting to login...`, 'error');
                localStorage.clear();
                window.location.href = 'login.html';
                return { error: "Session expired", status: 401 };
            }
        } else if (response.ok) {
            logWithTimestamp(`✅ [${requestId}] Request successful with current token`, 'success');
        }

        return response;
    } catch (error) {
        logWithTimestamp(`💥 [${requestId}] Network error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// 🔥 Monitor de tokens (ejecutar cada 30 segundos)
function startTokenMonitor() {
    logWithTimestamp("🔍 TOKEN MONITOR STARTED - Checking every 30 seconds", 'info');
    
    setInterval(() => {
        const tokenStatus = checkTokenExpiration();
        if (tokenStatus && tokenStatus.timeLeft > 0) {
            if (tokenStatus.timeLeft <= 60) {
                logWithTimestamp(`⚠️ TOKEN WARNING: Only ${tokenStatus.timeLeft}s left!`, 'warning');
            }
        }
    }, 30000);
}

// 🔥 Login de usuario (CORREGIDO - SIN process.env)
export async function loginUser(email, password) {
    try {
        logWithTimestamp("🔐 LOGIN ATTEMPT STARTED", 'info');
        
        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            logWithTimestamp(`❌ Login failed: ${data.message || "Login failed"}`, 'error');
            return { error: data.message || "Login failed" };
        }
        
        logWithTimestamp("🎉 LOGIN SUCCESSFUL!", 'success');
        
        // Guardar tokens y mostrar info
        if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
            logWithTimestamp("💾 Refresh token saved (7 days validity)", 'success');
        }
        
        // 🔥 CORREGIDO: Sin process.env
        logWithTimestamp("🔑 Access token received (2m validity)", 'success');
        
        // Iniciar monitor de tokens
        startTokenMonitor();
        
        // Verificar cuándo expira el token
        setTimeout(() => {
            checkTokenExpiration();
        }, 1000);
        
        return data;
    } catch (error) {
        logWithTimestamp(`💥 Login network error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Registro de usuario (CON LOGS)
export async function registerUser(data) {
    try {
        logWithTimestamp("📝 REGISTRATION ATTEMPT", 'info');
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if (res.ok) {
            logWithTimestamp("✅ Registration successful", 'success');
        } else {
            logWithTimestamp(`❌ Registration failed: ${result.error}`, 'error');
        }
        
        return result;
    } catch (error) {
        logWithTimestamp(`💥 Registration network error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Obtener sesión del usuario
export function getSession() {
    const token = localStorage.getItem("token");
    if (!token) {
        logWithTimestamp("❌ No active session found", 'warning');
        return null;
    }
    
    logWithTimestamp("✅ Active session found", 'info');
    checkTokenExpiration();
    
    return {
        token,
        userId: localStorage.getItem("userId"),
        userEmail: localStorage.getItem("userEmail")
    };
}

// Obtener favoritos con auto-refresh
export async function getFavorites() {
    logWithTimestamp("📋 GETTING FAVORITES", 'info');
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
        logWithTimestamp(`✅ Favorites retrieved: ${data.length || 0} items`, 'success');
        return data;
    } catch (error) {
        logWithTimestamp(`💥 Get favorites error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Agregar favorito con auto-refresh
export async function addFavorite(pokemonId, pokemonName) {
    logWithTimestamp(`❤️ ADDING FAVORITE: ${pokemonName} (ID: ${pokemonId})`, 'info');
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
        logWithTimestamp(`✅ Favorite added successfully: ${pokemonName}`, 'success');
        return data;
    } catch (error) {
        logWithTimestamp(`💥 Add favorite error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}

// Eliminar favorito con auto-refresh
export async function removeFavorite(pokemonId) {
    logWithTimestamp(`💔 REMOVING FAVORITE: ID ${pokemonId}`, 'info');
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
        logWithTimestamp(`✅ Favorite removed successfully: ID ${pokemonId}`, 'success');
        return data;
    } catch (error) {
        logWithTimestamp(`💥 Remove favorite error: ${error.message}`, 'error');
        return { error: "Network error" };
    }
}