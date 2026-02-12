import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from '../controllers/eventsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isEventOwner } from '../middleware/eventMiddleware.js';

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
router.put('/:id', isEventOwner, updateEvent);
router.delete('/:id', isEventOwner, deleteEvent);

export default router;