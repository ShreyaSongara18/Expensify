const jwt = require('jsonwebtoken');
const { error } = require('../utils/handler');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.send(error(401, 'Unauthorized: No token provided'));
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.send(error(401, 'Unauthorized: Token is empty'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.send(error(401, 'Unauthorized: Invalid or expired token'));
    }
};

module.exports = authMiddleware;
