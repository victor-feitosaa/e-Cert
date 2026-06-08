import express from 'express';
import {
  checkPermission,
  doCheckin,
  getEventAttendances,
  getEventParticipantsList,
  getEventInfo
} from '../controllers/checkinController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas as rotas exigem autenticação
router.use(protect);

// Verifica se usuário pode operar check-in
router.get('/:eventId/checkin/permission', checkPermission);

// Realiza check-in
router.post('/:eventId/checkin', doCheckin);

// Lista presenças já registradas
router.get('/:eventId/attendances', getEventAttendances);

// Lista participantes do evento (para o front)
router.get('/:eventId/participants/checkin', getEventParticipantsList);

// Dados básicos do evento
router.get('/:eventId/info', getEventInfo);

export default router;