class FavoriteDTO {
  constructor({ id, user_id, pokemon_id, pokemon_name }) {
    this.id = id;
    this.user_id = user_id;
    this.pokemon_id = pokemon_id;
    this.pokemon_name = pokemon_name;
  }
}

module.exports = FavoriteDTO;