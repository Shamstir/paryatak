import express from 'express'
import * as tripController from '../controllers/tripController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router;

router.use(authMiddleware);

router.post('/',tripController.createTrips);
router.get('/',tripController.getTrips);
router.put('/:id',tripController.updateTrip);
router.delete('/:id',tripController.deleteTrip);

export default router;