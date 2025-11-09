const express = require('express');
const router = express.Router();
const SearchHistoryDAO = require('../dao/historyDAO'); // Adjust the path if needed

// --- ENDPOINT: Create a search history record ---
router.post('/', async (req, res) => {
  const { user_id, pokemon_name } = req.body;
  if (!user_id || !pokemon_name) {
    return res.status(400).json({ success: false, error: 'Missing required data' });
  }
  const result = await SearchHistoryDAO.createSearchHistory({ user_id, pokemon_name });
  res.json(result);
});

// --- ENDPOINT: Get user's search history ---
router.get('/:user_id', async (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);
  if (!user_id) {
    return res.status(400).json({ success: false, error: 'Missing user_id' });
  }
  const result = await SearchHistoryDAO.getSearchHistoryByUser(user_id);
  res.json(result);
});

module.exports = router;