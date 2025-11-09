const db = require("../config/postgres"); // Tu pool de conexión con pg

class SearchHistoryDAO {
    // Crear registro de búsqueda
    static async createSearchHistory({ user_id, pokemon_name }) {
        const query = `SELECT create_search_history($1, $2) AS id`;
        try {
            const result = await db.query(query, [user_id, pokemon_name]);
            return { success: true, id: result.rows[0].id };
        } catch (error) {
            return { success: false, error: error.detail || error.message };
        }
    }

    // Obtener historial por usuario
    static async getSearchHistoryByUser(user_id) {
        const query = `SELECT * FROM get_search_history_by_user($1);`;
        try {
            const result = await db.query(query, [user_id]);
            return { success: true, history: result.rows };
        } catch (error) {
            return { success: false, error: error.detail || error.message };
        }
    }


}

module.exports = SearchHistoryDAO;