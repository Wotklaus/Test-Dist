const express = require('express');
const router = express.Router();
const RoleDAO = require('../dao/roleDAO');

const authMiddleware = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Get all roles (admin only)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  const result = await RoleDAO.getAllRoles();
  res.json(result);
});

// Get role by ID (admin only)
router.get('/:id', authMiddleware, isAdmin, async (req, res) => {
  const roleId = parseInt(req.params.id, 10);
  const result = await RoleDAO.getRoleById(roleId);
  res.json(result);
});

// Create new role (admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  const { name, description } = req.body;
  const result = await RoleDAO.createRole({ name, description });
  res.json(result);
});

// Delete role by ID (admin only)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  const roleId = parseInt(req.params.id, 10);
  const result = await RoleDAO.deleteRoleById(roleId);
  res.json(result);
});

module.exports = router;