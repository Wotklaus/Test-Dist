const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/postgres');
const bcrypt = require('bcryptjs');

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log("Login attempt for:", email);

    // Call stored procedure to get user data
    const result = await pool.query('SELECT * FROM login_user($1)', [email]);

    if (result.rows.length === 0) {
      console.log("User not found:", email);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    console.log("User received from database:", user);

    // Compare provided password with hashed password from database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Incorrect password for:", email);
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in .env');
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined in .env');
    }

    // Generate ACCESS TOKEN (short-lived - 2 minutes for testing)
    const accessTokenPayload = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      type: 'access'
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2m' }
    );

    // Generate REFRESH TOKEN (long-lived - 7 days)
    const refreshTokenPayload = {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      type: 'refresh'
    };

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    console.log("Tokens generated successfully");
    console.log("Access Token (2 min):", accessToken.substring(0, 50) + "...");
    console.log("Refresh Token (7 days):", refreshToken.substring(0, 50) + "...");

    // Save tokens in HTTP-Only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,        
      secure: isProduction,  // Only HTTPS in production
      sameSite: isProduction ? 'none' : 'lax',   // 'none' for cross-site, 'lax' for local/dev
      maxAge: 2 * 60 * 1000, 
      path: '/'              
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,        
      secure: isProduction,  // Only HTTPS in production
      sameSite: isProduction ? 'none' : 'lax',   // 'none' for cross-site, 'lax' for local/dev
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: '/'              
    });

    console.log("Tokens saved in HTTP-Only cookies successfully");
    console.log("AccessToken cookie: HttpOnly=true, MaxAge=2min");
    console.log("RefreshToken cookie: HttpOnly=true, MaxAge=7days");
    console.log(`Security flags: Secure=${isProduction}, SameSite=${isProduction ? "none" : "lax"}`);

    // Response without tokens (they are now secure in HTTP-Only cookies)
    res.status(200).json({
      message: 'Login successful - tokens saved in secure cookies',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;