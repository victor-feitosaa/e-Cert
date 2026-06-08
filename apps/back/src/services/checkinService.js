import CheckinRepository from '../repository/CheckinRepository.js';
import eventService from './eventService.js';

class CheckinService {
  /**
   * Verifica se o usuário pode realizar check-in no evento.
   */
  async checkPermission(userId, eventId) {
    const { allowed, reason } = await CheckinRepository.findCheckinPermission(userId, eventId);
    return { allowed, reason };
  }

  
  async doCheckin({ eventId, operatorId, participantId, userId, sectionId }) {
    // Verificar permissão do operador
    const { allowed } = await this.checkPermission(operatorId, eventId);
    if (!allowed) {
      throw new Error('Você não tem permissão para realizar check-in neste evento');
    }

    // Determinar o userId do participante
    let targetUserId = userId;
    if (!targetUserId && participantId) {
      const participant = await CheckinRepository.findEventParticipantById(participantId);
      if (!participant) {
        throw new Error('Participante não encontrado');
      }
      targetUserId = participant.userId;
    } else if (targetUserId) {
      // Garantir que o usuário está inscrito no evento (opcional, mas recomendado)
      const participant = await CheckinRepository.findEventParticipantByUserAndEvent(targetUserId, eventId);
      if (!participant) {
        throw new Error('Usuário não está inscrito neste evento');
      }
    } else {
      throw new Error('É necessário fornecer participantId ou userId');
    }

    // Registrar attendance
    let attendance;
    if (sectionId) {
      attendance = await CheckinRepository.upsertSectionAttendance(sectionId, targetUserId);
    } else {
      attendance = await CheckinRepository.upsertEventAttendance(eventId, targetUserId);
    }

    return attendance;
  }

  /**
   * Retorna todas as presenças já registradas no evento (para exibir na interface).
   */
  async getEventAttendances(eventId) {
    return CheckinRepository.findEventAttendances(eventId);
  }

  /**
   * Retorna lista de participantes inscritos no evento (útil para o front).
   */
  async getEventParticipants(eventId) {
    return CheckinRepository.findEventParticipants(eventId);
  }

  /**
   * Busca informações básicas do evento (título, datas, local).
   */
  async getEventInfo(eventId) {
    return CheckinRepository.findEventById(eventId);
  }
}

export default new CheckinService();