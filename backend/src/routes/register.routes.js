const express = require('express');
const bcrypt = require('bcryptjs');
const UserDAO = require('../dao/userDAO');
const UserDTO = require('../dto/userDTO');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Basic validation
    const { first_name, last_name, document_id, phone, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build DTO
    const userDTO = new UserDTO({
      first_name,
      last_name,
      document_id,
      phone,
      email,
      password: hashedPassword
    });

    // Register user via DAO
    const result = await UserDAO.registerUser(userDTO);

    if (result.success) {
      res.status(201).json({ message: 'User registered successfully', user_id: result.user_id });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;