const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // ✅ check if token exists
    if (!authHeader) {
        return res.status(401).send("Access Denied. No token provided.");
    }

    // format: "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send("Invalid token format");
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key");

        // attach user info to request
        req.user = decoded;

        next(); // move to next route
    } catch (err) {
        return res.status(401).send("Invalid or expired token");
    }
};

module.exports = authMiddleware;