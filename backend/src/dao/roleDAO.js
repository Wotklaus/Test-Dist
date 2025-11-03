const db = require("../config/postgres"); // Tu pool de conexión con pg

class RoleDAO {
    // Crear un nuevo rol usando el procedimiento almacenado
    static async createRole({ name, description }) {
        const query = `SELECT create_role($1, $2) AS id`;
        try {
            const result = await db.query(query, [name, description]);
            return { success: true, id: result.rows[0].id };
        } catch (error) {
            return { success: false, error: error.detail || error.message };
        }
    }

    // Obtener todos los roles usando el procedimiento almacenado
    static async getAllRoles() {
        const query = `SELECT * FROM get_all_roles();`;
        try {
            const result = await db.query(query);
            return { success: true, roles: result.rows };
        } catch (error) {
            return { success: false, error: error.detail || error.message };
        }
    }

    // Obtener un rol por id usando el procedimiento almacenado
    static async getRoleById(roleId) {
        const query = `SELECT * FROM get_role_by_id($1);`;
        try {
            const result = await db.query(query, [roleId]);
            if (result.rows.length === 0) return { success: false, error: "Role not found" };
            return { success: true, role: result.rows[0] };
        } catch (error) {
            return { success: false, error: error.detail || error.message };
        }
    }

    // Eliminar un rol por id usando el procedimiento almacenado
    static async deleteRoleById(roleId) {
        const query = `SELECT delete_role_by_id($1) AS deleted;`;
        try {
            const result = await db.query(query, [roleId]);
            return { success: true, deleted: result.rows[0].deleted };
        } catch (error) {
            return { success: false, error: error.detail || error.message };
        }
    }
}

module.exports = RoleDAO;