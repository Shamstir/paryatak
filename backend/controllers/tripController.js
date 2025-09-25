import {db} from '../db/connect.js'

const getUserId = async (firebaseUid) => {
    const {rows} = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
    return rows[0]?.id;
};

// --- CREATE ---
export const createTrips = async (req,res) => {
    const {destination_city, destination_country, start_date, end_date, itinerary_details} = req.body;
    try {
        const userId = await getUserId(req.user.firebase_uid);
        if (!userId) {
            return res.status(404).json({message: "User not found"});
        }
        const query = `
            INSERT INTO trips (user_id, destination_city, destination_country, start_date, end_date, itinerary_details)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [userId, destination_city, destination_country, start_date, end_date, itinerary_details];
        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating trip:',error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

// --- SEARCH ---
export const getTrips = async (req, res) => {
    try {
        const userId = await getUserId(req.user.firebase_uid);
        if (!userId) {
            return res.status(400).json({message: "User not found"});
        }
        const {rows} = await db.query('SELECT * FROM trips where user_id=$1 ORDER BY start_date DESC', [userId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching trips:',error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

// --- UPDATE ---
export const updateTrip = async (req, res) => {
    const { id } = req.params;
    const { destination_city, destination_country, start_date, end_date, itinerary_details } = req.body;

    try {
        const userId = await getUserId(req.user.firebase_uid);
        if (!userId) {
            return res.status(404).json({ message: "User not found." });
        }

        const query = `
            UPDATE trips
            SET destination_city = $1, destination_country = $2, start_date = $3, end_date = $4, itinerary_details = $5, updated_at = NOW()
            WHERE id = $6 AND user_id = $7
            RETURNING *;
        `;
        const values = [destination_city, destination_country, start_date, end_date, itinerary_details, id, userId];
        const { rows, rowCount } = await db.query(query, values);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Trip not found or you do not have permission to edit it." });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// --- DELETE ---
export const deleteTrip = async (req, res) => {
    const { id } = req.params;

    try {
        const userId = await getUserId(req.user.firebase_uid);
        if (!userId) {
            return res.status(404).json({ message: "User not found." });
        }
        const { rowCount } = await db.query('DELETE FROM trips WHERE id = $1 AND user_id = $2', [id, userId]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Trip not found or you do not have permission to delete it." });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};