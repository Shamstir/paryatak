import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './connect.js';
import { scheduleAiJobs } from './services/aiIntegrationServices.js';
import userRoutes from './routes/userRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import panicRoutes from './routes/panicRoutes.js';
import blockchainRoutes from './routes/blockchainRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());
app.use('/api/blockchain', blockchainRoutes);

db.connect();

scheduleAiJobs(io);

app.post('/api/location', async (req, res) => {
    const { touristId, latitude, longitude } = req.body;
    const point = `POINT(${longitude} ${latitude})`;

    try {
        await db.query(
            'INSERT INTO tourist_locations (tourist_id, location) VALUES ($1, ST_SetSRID(ST_GeomFromText($2), 4326))',
            [touristId, point]
        );

        const zoneQuery = await db.query(
            'SELECT name FROM high_risk_zones WHERE ST_Intersects(area, ST_SetSRID(ST_GeomFromText($1), 4326)) LIMIT 1',
            [point]
        );

        if (zoneQuery.rows.length > 0) {
            const zoneName = zoneQuery.rows[0].name;
            io.emit('geo-fence-alert', {
                touristId,
                zoneName,
                location: { latitude, longitude },
                timestamp: new Date(),
            });
        }
        res.status(201).send({ message: 'Location updated' });
    } catch (error) {
        res.status(500).send({ message: 'Error saving location', error: error.message });
    }
});

app.post('/api/alert/panic', async (req, res) => {
    const { touristId } = req.body;
    try {
        io.emit('new-panic-alert', {
            touristId,
            timestamp: new Date(),
        });
        res.status(200).send({ message: 'Panic alert sent' });
    } catch (error) {
        res.status(500).send({ message: 'Failed to send alert', error: error.message });
    }
});

app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/alerts', panicRoutes);

app.get('/', (req, res) => {
    res.send('Backend is running properly');
});

server.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});