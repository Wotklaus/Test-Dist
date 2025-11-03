const express = require('express');
const router = express.Router();
const RoleDAO = require('../dao/roleDAO'); // Tu DAO

// Obtener todos los roles
router.get('/', async (req, res) => {
  const result = await RoleDAO.getAllRoles();
  res.json(result);
});

// Obtener rol por ID
router.get('/:id', async (req, res) => {
  const roleId = parseInt(req.params.id, 10);
  const result = await RoleDAO.getRoleById(roleId);
  res.json(result);
});

// Crear nuevo rol (solo admin)
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const result = await RoleDAO.createRole({ name, description });
  res.json(result);
});

// Eliminar rol por ID (solo admin)
router.delete('/:id', async (req, res) => {
  const roleId = parseInt(req.params.id, 10);
  const result = await RoleDAO.deleteRoleById(roleId);
  res.json(result);
});

module.exports = router;