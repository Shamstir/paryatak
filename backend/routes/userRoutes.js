import express from 'express'
import * as userController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/sync',authMiddleware,userController.syncUser);
router.get('/profile',userController.getUserProfile);
router.get('/safety-score',userController.getSafetyScore);

export default router;