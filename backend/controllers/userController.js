import { db } from '../db/connect.js';
import crypto from 'crypto';

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

export const issueDigitalId = async (req, res) => {
    try {
        const {firebase_uid} = req.user;
        const userQuery = 'SELECT id, kyc_data FROM users WHERE firebase_uid = $1';
        const {rows} = await db.query(userQuery,[firebase_uid]);
        if (rows.length==0 || !rows[0].kyc_data) {
            return res.status(404).json({message: "User or KYC data not found"})
        }
        const user = rows[0];
        const kycString = `${user.id}:${user.kyc_data.documentNumber}:${user.kyc_data.documentType}`;

        //Calculate the SHA-256 hash
        const hash = crypto.createHash('sha256').update(kycString).digest('hex');
        console.log(`Generated KYC Hash for user ${user.id}: ${hash}`);

        // 4. Trigger the internal blockchain service (built by Backend Dev 2)
        // This is a placeholder for the actual call. You will coordinate the
        // exact URL and data structure with Backend Dev 2.
        /*
        await axios.post('http://localhost:3002/internal/issue-id', {
            userId: user.id,
            kycHash: hash
        });
        */
        // For now, we will simulate a successful call.

        await db.query("UPDATE users SET digital_id_status = 'issuing' WHERE id = $1", [user.id]);

        // 6. Respond to the Flutter app
        res.status(200).json({ message: "Digital ID issuance process started." });

    } catch (error) {
        console.error('Error issuing digital ID:', error);
        res.status(500).json({ message: 'Server error during ID issuance.' });
    }
};