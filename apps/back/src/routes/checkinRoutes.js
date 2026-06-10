import express from 'express';
import { checkPermission, doCheckin, getAttendances } from '../controllers/checkinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/:eventId/checkin/permission', checkPermission);
router.post('/:eventId/checkin', doCheckin);
router.get('/:eventId/attendances', getAttendances);

export default router;