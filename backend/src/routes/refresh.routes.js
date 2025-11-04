const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * POST /api/refresh
 * Purpose: Renew access token using refresh token
 * Body: { refreshToken: "refresh_token_here" }
 * Response: { token: "new_access_token" }
 */
router.post('/', async (req, res) => {
    console.log("Refresh token request received");

    const { refreshToken } = req.body;

    // Validate refresh token is provided
    if (!refreshToken) {
        console.log("No refresh token provided");
        return res.status(401).json({
            error: 'Refresh token is required',
            code: 'MISSING_REFRESH_TOKEN'
        });
    }

    console.log("Validating refresh token...");

    try {
        // Verify refresh token signature and expiration
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        console.log("✅ Refresh token is valid!");
        console.log("👤 User ID:", decoded.id);
        console.log("📧 Email:", decoded.email);
        console.log("🎭 Role:", decoded.role_id);

        // Verify token type is 'refresh'
        if (decoded.type !== 'refresh') {
            console.log("❌ Invalid token type:", decoded.type);
            return res.status(401).json({
                error: 'Invalid token type',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

        // Generate NEW access token with same user data
        const newAccessTokenPayload = {
            id: decoded.id,
            email: decoded.email,
            role_id: decoded.role_id,
            type: 'access'
        };

        const newAccessToken = jwt.sign(
            newAccessTokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2m' }
        );

        console.log("🆕 New access token generated successfully");
        console.log("⏰ Token valid for:", process.env.JWT_EXPIRES_IN || '2m');

        // Return new access token
        res.status(200).json({
            message: 'Token refreshed successfully',
            token: newAccessToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '2m',
            refreshedAt: new Date().toISOString()
        });

    } catch (error) {
        console.log("❌ Error validating refresh token:", error.message);

        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Refresh token has expired',
                code: 'REFRESH_TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid refresh token format',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        // Generic error for other cases
        return res.status(401).json({
            error: 'Invalid refresh token',
            code: 'REFRESH_TOKEN_INVALID'
        });
    }
});

module.exports = router;