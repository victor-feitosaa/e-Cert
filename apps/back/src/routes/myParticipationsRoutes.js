import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyParticipations } from '../controllers/participantController.js';

const router = express.Router();

router.use(protect);
router.get('/my-events', getMyParticipations);

export default router;