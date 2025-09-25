import express from 'express'
import * as userController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.use(authMiddleware);
router.post('/sync',userController.syncUser);
router.get('/profile',userController.getUserProfile);
router.get('/safety-score',userController.getSafetyScore);
router.post('/issue-id',userController.issueDigitalId);

export default router;