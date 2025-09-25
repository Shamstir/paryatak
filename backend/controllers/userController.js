import { db } from '../db/connect.js';

export const syncUser = async (req, res) => {
    const { firebase_uid, email } = req.user;
    const { fullName } = req.body;

    try {
        const query = `
            INSERT INTO users (firebase_uid, full_name, email)
            VALUES ($1, $2, $3)
            ON CONFLICT (firebase_uid) DO NOTHING;
        `;
        await db.query(query, [firebase_uid, fullName, email]);
        res.status(201).json({ message: 'User synced successfully.' });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Server error during user sync.' });
    }
};