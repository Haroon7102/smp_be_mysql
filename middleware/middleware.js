const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    console.log('JWT Secret:', process.env.JWT_SECRET);
    console.log('Received Token:', token);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);

        res.status(401).json({ msg: 'Token is not valid' });
    }
};


module.exports = authMiddleware;
