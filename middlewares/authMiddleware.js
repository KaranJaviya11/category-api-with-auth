const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token?.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};