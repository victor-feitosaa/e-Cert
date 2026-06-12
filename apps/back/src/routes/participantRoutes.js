// src/routes/participantRoutes.js
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  addEventParticipant,
  getEventParticipants,
  getEventParticipantById,

  deleteEventParticipant,
  bulkAddEventParticipants,
  checkEventEnrollment,
  addSubeventParticipant,
  getSubeventParticipants,
  deleteSubeventParticipant,
  checkSubeventEnrollment,
  getMyParticipations,
  inviteParticipantByEmail,
  deleteEventParticipantByUserAndEvent,
} from '../controllers/participantController.js'

const router = express.Router({ mergeParams: true })

// Todas as rotas requerem autenticação
router.use(protect)

// Rotas para participantes do evento
router.route('/')
  .post(addEventParticipant)
  .get(getEventParticipants)

router.get('/check', checkEventEnrollment)   /

router.post('/invite',inviteParticipantByEmail)
router.post('/bulk', bulkAddEventParticipants)

router.delete('/', deleteEventParticipantByUserAndEvent);

router.route('/:id')
  .get(getEventParticipantById)

  .delete(deleteEventParticipant)


// Rotas para participantes do subevento
router.post('/subevent/:subEventId', addSubeventParticipant)
router.get('/subevent/:subEventId', getSubeventParticipants)
router.delete('/subevent/:id', deleteSubeventParticipant)
router.get('/subevent/:subEventId/check', checkSubeventEnrollment);


export default router