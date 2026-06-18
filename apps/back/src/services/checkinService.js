// src/services/CheckinService.js
import CheckinRepository from '../repository/CheckinRepository.js';
import jwt from 'jsonwebtoken';

class CheckinService {
  async checkPermission(userId, eventId) {
    return CheckinRepository.findCheckinPermission(userId, eventId);
  }

  async getEventInfo(eventId) {
    return CheckinRepository.findEventById(eventId);
  }

  /**
   * Realiza check-in no evento ou em uma seção.
   * Retorna o objeto attendance (evento ou seção).
   */
  async doCheckin({ eventId, operatorId, participantId, userId, sectionId }) {
    // 1) Verificar permissão do operador
    const { allowed } = await this.checkPermission(operatorId, eventId);
    if (!allowed) {
      throw new Error('Sem permissão para realizar check-in');
    }

    // 2) Determinar o userId do alvo
    let targetUserId = userId;
    if (!targetUserId && participantId) {
      const participant = await CheckinRepository.findEventParticipantById(participantId);
      if (!participant) {
        throw new Error('Participante não encontrado');
      }
      targetUserId = participant.userId;
    }

    if (!targetUserId) {
      throw new Error('É necessário fornecer participantId ou userId');
    }

    // 3) Verificar se o usuário está inscrito no evento
    const enrollment = await CheckinRepository.findEventParticipantByUserAndEvent(targetUserId, eventId);
    if (!enrollment) {
      throw new Error('Usuário não está inscrito neste evento');
    }

    // 4) Se for check-in em seção, validar regras específicas
    if (sectionId) {
      // 4a) Verificar inscrição na seção
      const sectionEnrollment = await CheckinRepository.findSectionEnrollment(targetUserId, sectionId);
      if (!sectionEnrollment) {
        throw new Error('Usuário não está inscrito nesta seção');
      }

      // 4b) Verificar se já fez check-in no evento principal (regra de negócio)
      const eventAttendance = await CheckinRepository.findEventAttendance(targetUserId, eventId);
      if (!eventAttendance || !eventAttendance.attended) {
        throw new Error('Check-in na seção só é permitido após check-in no evento principal');
      }

      // 4c) Registrar/atualizar presença na seção
      return await CheckinRepository.upsertSectionAttendance(sectionId, targetUserId);
    }

    // 5) Check-in geral do evento
    return await CheckinRepository.upsertEventAttendance(eventId, targetUserId);
  }

  /**
   * Retorna lista de participantes com status de check-in (evento + seções).
   * Útil para a interface do credenciador.
   */
  async getEventAttendancesWithParticipants(eventId) {
    // Buscar participantes
    const participants = await CheckinRepository.findEventParticipants(eventId);

    // Buscar presenças do evento
    const eventAttendances = await CheckinRepository.findEventAttendances(eventId);
    const eventMap = new Map();
    eventAttendances.forEach(a => {
      eventMap.set(a.userId, { event: a.attended, checkedInAt: a.updatedAt });
    });

    // Buscar presenças das seções
    const sectionAttendances = await CheckinRepository.findSectionAttendancesByEvent(eventId);
    const sectionMap = new Map();
    sectionAttendances.forEach(att => {
      if (att.attended) {
        if (!sectionMap.has(att.userId)) sectionMap.set(att.userId, []);
        sectionMap.get(att.userId).push(att.sectionId);
      }
    });

    // Montar resposta
    return participants.map(p => ({
      id: p.id,
      userId: p.userId,
      user: p.user,
      attended: eventMap.get(p.userId)?.event || false,
      checkedInAt: eventMap.get(p.userId)?.checkedInAt || null,
      sectionCheckins: sectionMap.get(p.userId) || []
    }));
  }

  /**
   * Gera token JWT para QR Code de check-in.
   */
  generateCheckinToken(userId, eventId, sectionId = null) {
    const payload = { userId, eventId };
    if (sectionId) payload.sectionId = sectionId;
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  }
}

export default new CheckinService();