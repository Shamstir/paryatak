import admin from '../utils/firebaseAdmin.js'

const authMiddleware = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Forbidden: No token provided.' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
            firebase_uid: decodedToken.uid,
            email: decodedToken.email,
        };
        next();
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(403).json({ message: 'Forbidden: Invalid token.' });
    }
};

export default authMiddleware;