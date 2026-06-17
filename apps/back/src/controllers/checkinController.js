
import CheckinService from '../services/CheckinService.js';


// 1. Verificar permissão do credenciador

export const checkPermission = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const { allowed, reason, role } = await CheckinService.checkPermission(userId, eventId);
    res.json({ allowed, reason, role });
  } catch (error) {
    console.error('Erro em checkPermission:', error);
    res.status(500).json({ allowed: false, error: error.message });
  }
};


// 2. Realizar check‑in (evento ou seção)

export const doCheckin = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { participantId, userId, sectionId } = req.body;
    const operatorId = req.user.id;

    const attendance = await CheckinService.doCheckin({
      eventId,
      operatorId,
      participantId,
      userId,
      sectionId
    });

    res.status(200).json({
      status: 'success',
      data: { attendance }
    });
  } catch (error) {
    console.error('Erro em doCheckin:', error);
    const status = error.message.includes('permissão') ? 403
      : error.message.includes('encontrado') ? 404
      : error.message.includes('inscrito') ? 400
      : 500;
    res.status(status).json({
      status: 'fail',
      message: error.message || 'Erro interno no servidor'
    });
  }
};


// 3. Listar participantes com status de check‑in

export const getAttendances = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    
    const { allowed } = await CheckinService.checkPermission(userId, eventId);
    if (!allowed) {
      return res.status(403).json({
        status: 'fail',
        message: 'Sem permissão para visualizar check-ins'
      });
    }

    const attendances = await CheckinService.getEventAttendancesWithParticipants(eventId);

    res.status(200).json({
      status: 'success',
      data: { attendances }
    });
  } catch (error) {
    console.error('Erro em getAttendances:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno no servidor'
    });
  }
};


// 4. Gerar token para QR Code

export const getCheckinToken = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { sectionId } = req.query;
    const userId = req.user.id;

    const token = CheckinService.generateCheckinToken(userId, eventId, sectionId);
    res.json({ token });
  } catch (error) {
    console.error('Erro em getCheckinToken:', error);
    res.status(500).json({ error: error.message });
  }
};