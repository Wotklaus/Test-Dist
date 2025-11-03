export const API_URL = 'http://localhost:3000';

// Login de usuario
export async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.message || "Login failed" };
        }
        return data;
    } catch (error) {
        return { error: "Network error" };
    }
}

// Registro de usuario
export async function registerUser(data) {
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        return { error: "Network error" };
    }
}

// Obtener sesión del usuario conectad@ desde localStorage
export function getSession() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
        token,
        userId: localStorage.getItem("userId"),
        userEmail: localStorage.getItem("userEmail")
    };
}

// Obtener favoritos del usuario
export async function getFavorites(token) {
    try {
        const res = await fetch(`${API_URL}/api/favorites`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Si falla la sesión, devuelve el status para que el frontend sepa
        if (!res.ok) {
            return { error: "Unauthorized", status: res.status };
        }
        return await res.json();
    } catch (error) {
        return { error: "Network error" };
    }
}

// Agregar favorito
export async function addFavorite(token, pokemonId, pokemonName) {
    try {
        const res = await fetch(`${API_URL}/api/favorites`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pokemon_id: pokemonId, pokemon_name: pokemonName })
        });
        return await res.json();
    } catch (error) {
        return { error: "Network error" };
    }
}

// Eliminar favorito
export async function removeFavorite(token, pokemonId) {
    try {
        const res = await fetch(`${API_URL}/api/favorites`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pokemon_id: pokemonId })
        });
        return await res.json();
    } catch (error) {
        return { error: "Network error" };
    }
}