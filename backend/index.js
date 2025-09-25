import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();
import userRoutes from './routes/userRoutes.js'
import tripRoutes from './routes/tripRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use('/api/users',userRoutes);
app.use('/api/trips',tripRoutes);

app.get('/',(req,res) => {
    res.send('Backend is running properly');
});

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});
