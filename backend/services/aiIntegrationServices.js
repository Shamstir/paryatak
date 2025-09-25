import cron from 'node-cron';
import axios from 'axios';
import { db } from '../db/connect.js';


const fetchAndStoreSafetyScores = async () => {
    console.log('Running scheduled job: Fetching safety scores...');
    try {
        const { rows: users } = await db.query('SELECT id FROM users');
        if (users.length === 0) {
            console.log('No users to process. Skipping.');
            return;
        }

        for (const user of users) {
            // The AI Dev will give you this URL. This is a placeholder.
            const aiServiceUrl = 'http://localhost:8000/calculate-score'; 

            // 3. Get the score from the AI service
            const response = await axios.post(aiServiceUrl, {
                userId: user.id
                // The AI service might need more data, like recent locations.
            });

            const { score, factors } = response.data;
            await db.query(
                'INSERT INTO safety_scores (user_id, score, factors) VALUES ($1, $2, $3)',
                [user.id, score, factors]
            );
            console.log(`Stored safety score for user ${user.id}: ${score}`);
        }
    } catch (error) {
        console.error('Error during scheduled AI job:', error.message);
    }
};


export const scheduleAiJobs = () => {
    cron.schedule('*/15 * * * * *', fetchAndStoreSafetyScores);
    console.log('AI safety score job scheduled to run every 15 seconds.');
};