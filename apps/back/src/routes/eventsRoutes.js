import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  inviteModerator,
} from '../controllers/eventsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isEventOwner } from '../middleware/eventMiddleware.js';
import { createTeamMember, deleteMember, getMyTeam, updateMember } from '../controllers/eventsTeamController.js';
import { convidarMod } from '../controllers/testController.js';
import { hasRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Rotas públicas
router.get('/', getEvents);
router.get('/:id', getEventById);

// Proteger todas as rotas abaixo
router.use(protect);

// Rotas do usuário autenticado
router.get('/my/events', getMyEvents);
router.post('/', createEvent);

// Rotas que requerem ser dono do evento
router.patch('/:id', hasRole, updateEvent);
router.delete('/:id', isEventOwner, deleteEvent);

// Convidar Moderador
router.post('/:id/invite/:email', isEventOwner, inviteModerator);

router.get('/:id/getMyTeam', isEventOwner, getMyTeam);
router.post('/:id/createMember', isEventOwner, createTeamMember);
router.put('/:id/member/:memberId',isEventOwner, updateMember);
router.delete('/:id/member/:memberId', isEventOwner, deleteMember);






export default router;