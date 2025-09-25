import express from 'express'
import * as userController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/sync',authMiddleware,userController.syncUser);

export default router;