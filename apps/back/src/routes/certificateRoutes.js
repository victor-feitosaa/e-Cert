
import express from 'express';
import{downloadCertificate, listMyCertificates, sendCertificateEmail, verifyCertificate} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, listMyCertificates);
router.get('/verify/:hash',  verifyCertificate);
router.get('/download/:hash', protect, downloadCertificate);
router.post('/:id/send', protect, sendCertificateEmail);


export default router;