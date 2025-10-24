const pool = require("../config/postgres");
const FavoriteDTO = require("../dto/favoritesDTO");

class FavoriteDAO {
  static async getFavorites(userId) {
    const result = await pool.query("SELECT * FROM get_favorites($1)", [userId]);
    return result.rows.map(row => new FavoriteDTO(row));
  }

  static async addFavorite(userId, pokemonId, pokemonName) {
    await pool.query("SELECT add_favorite($1, $2, $3)", [userId, pokemonId, pokemonName]);
    return this.getFavorites(userId);
  }

  static async removeFavorite(userId, pokemonId) {
    await pool.query("SELECT remove_favorite($1, $2)", [userId, pokemonId]);
    return this.getFavorites(userId);
  }
}

module.exports = FavoriteDAO;