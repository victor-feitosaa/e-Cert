import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { hasRole } from '../middleware/roleMiddleware.js';
import {
  exportParticipants,
  exportCertificates,
  exportSubevents
} from '../controllers/exportController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(hasRole); // só organizador/moderador

router.get('/participants', exportParticipants);
router.get('/certificates', exportCertificates);
router.get('/subevents', exportSubevents);

export default router;