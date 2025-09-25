import express from 'express';
import { issueId, verifyId } from '../services/blockchainService.js';

const router = express.Router();


router.post('/issue-id', async (req, res) => {
    const { touristId, kycData } = req.body;
    try {
        const transactionHash = await issueId(touristId, kycData);
        res.status(200).json({ message: 'Digital ID successfully issued', transactionHash });
    } catch (error) {
        res.status(500).json({ message: 'Failed to issue ID', error: error.message });
    }
});


router.get('/verify-id/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const verificationStatus = await verifyId(id);
        res.status(200).json(verificationStatus);
    } catch (error) {
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
});

export default router;