import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  inviteModerator,
  getModerators,
  deleteModerator,
  getAllEvents,
  getEventParticipants,
  getEventParticipantCount,
  confirmAttendance,
} from '../controllers/eventsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isEventOwner } from '../middleware/eventMiddleware.js';
import { 
  createTeamMember, 
  deleteMember, 
  getMyTeam, 
  inviteTeamMemberByEmail, 
  updateMember, 
  updateMemberPermission
} from '../controllers/eventsTeamController.js';
import { convidarMod } from '../controllers/testController.js';
import { hasRole } from '../middleware/roleMiddleware.js';
import * as certificateTemplateController from '../controllers/certificateTemplateController.js';

const router = express.Router();

// ──────────────────────────────────────────────
// ROTAS PÚBLICAS (não requerem autenticação)
// ──────────────────────────────────────────────
router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/get/all', getAllEvents); 
router.get('/:id/participants/count', getEventParticipantCount);

// ──────────────────────────────────────────────
// ROTAS PROTEGIDAS (requerem autenticação)
// ──────────────────────────────────────────────
router.use(protect);

// Rotas do usuário autenticado
router.get('/my/events', getMyEvents);
router.post('/', createEvent);

router.post("/:id/confirmAttendance", confirmAttendance);

// ──────────────────────────────────────────────
// ROTAS QUE REQUEREM SER DONO DO EVENTO
// ──────────────────────────────────────────────
router.put('/:id', hasRole, updateEvent);
router.delete('/:id', isEventOwner, deleteEvent);
router.get('/:id/eventParticipants', hasRole, getEventParticipants); 

// ──────────────────────────────────────────────
// MODERADORES
// ──────────────────────────────────────────────
router.get('/:id/moderators', hasRole, getModerators);
router.post('/:id/invite/:email', isEventOwner, inviteModerator);
router.delete('/:id/moderator/:moderatorId', isEventOwner, deleteModerator);

// ──────────────────────────────────────────────
// MEMBROS DA EQUIPE
// ──────────────────────────────────────────────
router.put('/:id/team/:memberId/permission', updateMemberPermission);


router.route('/:id/team')
  .get(getMyTeam)                           // Listar membros
  .post(createTeamMember);                   // Adicionar membro manualmente

router.post('/:id/team/invite', inviteTeamMemberByEmail);  // Convidar por email

router.route('/:id/team/:memberId')
  .put(updateMember)                         // Atualizar membro
  .patch(updateMember)                       // Atualizar membro (parcial)
  .delete(deleteMember);                     // Remover membro

// certificado
import { 
  listEventCertificates, 
  generateEventCertificates, 
  getCertificateStats
} from '../controllers/certificateController.js';

// ... dentro do roteador, após o middleware de autenticação e permissão
router.get('/:eventId/certificates', protect, hasRole, listEventCertificates);
router.post('/:eventId/certificates/generate', protect, hasRole, generateEventCertificates);



// Templates de certificado
router.get('/:eventId/certificate-templates', protect, hasRole, certificateTemplateController.listTemplates);
router.post('/:eventId/certificate-templates', protect,  certificateTemplateController.createTemplate);
router.get('/:eventId/certificate-templates/:templateId', protect, hasRole, certificateTemplateController.getTemplate);
router.put('/:eventId/certificate-templates/:templateId', protect, isEventOwner, certificateTemplateController.updateTemplate);
router.delete('/:eventId/certificate-templates/:templateId', protect, isEventOwner, certificateTemplateController.deleteTemplate);
router.post('/:eventId/certificate-templates/:templateId/generate', protect,  certificateTemplateController.generateCertificatesFromTemplate);
router.get('/:eventId/certificates/stats', protect, getCertificateStats);

export default router;