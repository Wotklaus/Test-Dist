const db = require('../db'); // Tu pool de conexión con pg

class UserDAO {
  static async registerUser(userDTO) {
    const {
      first_name,
      last_name,
      document_id,
      phone,
      email,
      password
    } = userDTO;

    const query = `
      SELECT register_user($1, $2, $3, $4, $5, $6) AS user_id
    `;
    try {
      const result = await db.query(query, [first_name, last_name, document_id, phone, email, password]);
      return { success: true, user_id: result.rows[0].user_id };
    } catch (error) {
      return { success: false, error: error.detail || error.message };
    }
  }
}

module.exports = UserDAO;