import CheckinService from '../services/checkinService.js';
import eventService from '../services/eventService.js';

/**
 * GET /api/events/:eventId/checkin/permission
 * Retorna { allowed: boolean }
 */
export const checkPermission = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  try {
    const { allowed, reason } = await CheckinService.checkPermission(userId, eventId);
    res.json({ allowed, reason });
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    res.status(500).json({ allowed: false, message: 'Erro interno' });
  }
};

/**
 * POST /api/events/:eventId/checkin
 * Body: { participantId, userId, sectionId }
 */
export const doCheckin = async (req, res) => {
  const { eventId } = req.params;
  const operatorId = req.user.id;
  const { participantId, userId, sectionId } = req.body;

  try {
    const attendance = await CheckinService.doCheckin({
      eventId,
      operatorId,
      participantId,
      userId,
      sectionId
    });
    res.status(201).json({ success: true, attendance });
  } catch (error) {
    console.error('Erro ao realizar check-in:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/events/:eventId/attendances
 * Lista todas as presenças registradas no evento.
 */
export const getEventAttendances = async (req, res) => {
  const { eventId } = req.params;
  try {
    const attendances = await CheckinService.getEventAttendances(eventId);
    res.status(200).json({ status: 'success', data: { attendances } });
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno' });
  }
};

/**
 * GET /api/events/:eventId/participants (se já não existir, mas podemos usar o existente)
 * Mas para o checkin precisamos dos participantes, então reutilizamos.
 * Caso não exista, implementamos.
 */
export const getEventParticipantsList = async (req, res) => {
  const { eventId } = req.params;
  try {
    const participants = await CheckinService.getEventParticipants(eventId);
    res.status(200).json({ status: 'success', data: { participants } });
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno' });
  }
};

/**
 * GET /api/events/:eventId/info (dados básicos do evento)
 */
export const getEventInfo = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await CheckinService.getEventInfo(eventId);
    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Evento não encontrado' });
    }
    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno' });
  }
};