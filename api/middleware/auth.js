const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let token = req.header('x-auth-token') || req.header('Authorization');
    
    // If it's a Bearer token, strip the "Bearer " prefix
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
