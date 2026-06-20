
import express from 'express';
import * as certificateController from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, certificateController.listMyCertificates);
router.get('/verify/:hash', certificateController.verifyCertificate);

export default router;