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

export const getUserProfile = async (req, res) => {
    try {
        const { firebase_uid } = req.user;
        
        const query = 'SELECT id, firebase_uid, full_name, email, kyc_status FROM users WHERE firebase_uid = $1';
        const { rows } = await db.query(query, [firebase_uid]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
};

export const getSafetyScore = async (req,res) => {
    try {
        const {firebase_uid} =req.user;
        const query = `
            SELECT s.score, s.factors, s.calculated_at
            FROM safety_scores s
            JOIN users u ON s.user_id = u.id
            WHERE u.firebase_uid = $1
            ORDER BY s.calculated_at DESC
            LIMIT 1;
        `;

        const { rows } = await db.query(query, [firebase_uid]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No safety score found for this user.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching safety score:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};