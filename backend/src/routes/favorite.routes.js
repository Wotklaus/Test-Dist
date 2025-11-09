const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const FavoriteDAO = require('../dao/favoritesDAO');

// JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET /api/favorites - get all user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await FavoriteDAO.getFavorites(req.user.id);
    res.json({ favorites });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/favorites - add a favorite
router.post('/', authenticateToken, async (req, res) => {
  const { pokemon_id, pokemon_name } = req.body;
  if (!pokemon_id || !pokemon_name) {
    return res.status(400).json({ error: 'Missing pokemon_id or pokemon_name' });
  }
  try {
    const favorites = await FavoriteDAO.addFavorite(req.user.id, pokemon_id, pokemon_name);
    res.json({ favorites });
  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/favorites - remove a favorite
router.delete('/', authenticateToken, async (req, res) => {
  const { pokemon_id } = req.body;
  if (!pokemon_id) {
    return res.status(400).json({ error: 'Missing pokemon_id' });
  }
  try {
    const favorites = await FavoriteDAO.removeFavorite(req.user.id, pokemon_id);
    res.json({ favorites });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;