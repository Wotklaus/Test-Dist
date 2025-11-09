class SearchHistoryDTO {
    constructor({ id, user_id, pokemon_name, timestamp }) {
        this.id = id;
        this.user_id = user_id;
        this.pokemon_name = pokemon_name;
        this.timestamp = timestamp;
    }
}

module.exports = SearchHistoryDTO;