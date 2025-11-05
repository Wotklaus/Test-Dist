const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    console.log("TOKEN REFRESH REQUEST RECEIVED");

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        console.log("No refresh token found in cookies");
        console.log("Available cookies:", Object.keys(req.cookies || {}));
        return res.status(401).json({
            error: 'Refresh token not found in cookies',
            code: 'MISSING_REFRESH_TOKEN',
            requiresLogin: true
        });
    }

    console.log("Validating refresh token from cookie...");
    console.log("Token preview:", refreshToken.substring(0, 20) + "...");

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        console.log("Refresh token is valid");
        console.log("User ID:", decoded.id);
        console.log("Email:", decoded.email);
        console.log("Role:", decoded.role_id);

        if (decoded.type !== 'refresh') {
            console.log("Invalid token type:", decoded.type);
            return res.status(401).json({
                error: 'Invalid token type',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

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

        console.log("NEW ACCESS TOKEN GENERATED AND SENT");
        console.log("Token valid for:", process.env.JWT_EXPIRES_IN || '2m');

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 1000,
            path: '/'
        });

        console.log("New access token saved in HTTP-Only cookie");

        res.status(200).json({
            message: 'Token refreshed successfully',
            expiresIn: process.env.JWT_EXPIRES_IN || '2m',
            refreshedAt: new Date().toISOString()
        });

    } catch (error) {
        console.log("TOKEN REFRESH FAILED:", error.message);

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        console.log("Invalid cookies cleared");

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Refresh token has expired',
                code: 'REFRESH_TOKEN_EXPIRED',
                requiresLogin: true
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid refresh token format',
                code: 'INVALID_REFRESH_TOKEN',
                requiresLogin: true
            });
        }

        return res.status(401).json({
            error: 'Invalid refresh token',
            code: 'REFRESH_TOKEN_INVALID',
            requiresLogin: true
        });
    }
});

module.exports = router;