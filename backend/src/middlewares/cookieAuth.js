// middleware/cookieAuth.js
const jwt = require('jsonwebtoken');

function extractTokenFromCookies(req, res, next) {
    console.log("Extracting token from cookies");
    
    const accessToken = req.cookies.accessToken;
    
    if (accessToken) {
        req.headers.authorization = `Bearer ${accessToken}`;
        console.log("Token extracted from HTTP-Only cookie");
        console.log("Token preview:", accessToken.substring(0, 20) + "...");
    } else {
        console.log("No access token found in cookies");
        console.log("ACCESS TOKEN EXPIRED - Client will request refresh");
    }
    
    next();
}

function clearAuthCookies(req, res, next) {
    console.log("Clearing authentication cookies");
    
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
    
    console.log("Auth cookies cleared");
    next();
}

module.exports = { 
    extractTokenFromCookies, 
    clearAuthCookies 
};