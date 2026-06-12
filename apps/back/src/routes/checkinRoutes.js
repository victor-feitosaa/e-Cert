import express from 'express';
import { checkPermission, doCheckin, getAttendances, getCheckinToken } from '../controllers/checkinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/:eventId/checkin/permission', checkPermission);
router.post('/:eventId/checkin', doCheckin);
router.get('/:eventId/attendances', getAttendances);
router.get('/:eventId/checkin-token', getCheckinToken); 

export default router;