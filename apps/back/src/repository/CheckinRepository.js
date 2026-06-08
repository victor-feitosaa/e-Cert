import { prisma } from '../config/db.js';

class CheckinRepository {
  /**
   * Busca permissão de check-in para um usuário em um evento.
   * Permissão pode ser via EventPermission (role CHECKIN ou MODERATOR) ou ser o organizador.
   */
  async findCheckinPermission(userId, eventId) {
    // Primeiro verifica se é organizador
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdBy: true }
    });
    if (event?.createdBy === userId) {
      return { allowed: true, reason: 'organizer' };
    }

    // Verifica permissão direta
    const permission = await prisma.eventPermission.findFirst({
      where: {
        eventId,
        userId,
        role: { in: ['CHECKIN', 'MODERATOR'] }
      }
    });
    if (permission) {
      return { allowed: true, reason: 'permission', role: permission.role };
    }
    return { allowed: false };
  }

  /**
   * Busca os dados do evento (apenas para verificação)
   */
  async findEventById(eventId) {
    return prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, date_start: true, date_end: true }
    });
  }

  /**
   * Busca o participante (inscrição no evento) pelo ID do registro EventParticipant.
   */
  async findEventParticipantById(participantId) {
    return prisma.eventParticipant.findUnique({
      where: { id: participantId },
      include: { user: { select: { id: true, name: true, email: true, cpf: true } } }
    });
  }

  /**
   * Busca o participante pelo userId e eventId.
   */
  async findEventParticipantByUserAndEvent(userId, eventId) {
    return prisma.eventParticipant.findFirst({
      where: { userId, eventId },
      include: { user: { select: { id: true, name: true, email: true, cpf: true } } }
    });
  }

  /**
   * Cria ou atualiza o registro de attendance (check-in) no evento.
   */
  async upsertEventAttendance(eventId, userId) {
    return prisma.eventAttendance.upsert({
      where: { userId_eventId: { userId, eventId } },
      update: { attended: true },
      create: { userId, eventId, attended: true }
    });
  }

  /**
   * Cria ou atualiza o registro de attendance (check-in) em uma seção.
   */
  async upsertSectionAttendance(sectionId, userId) {
    return prisma.sectionAttendance.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      update: { attended: true },
      create: { userId, sectionId, attended: true }
    });
  }

  /**
   * Lista todas as presenças (attendances) de um evento.
   */
  async findEventAttendances(eventId) {
    return prisma.eventAttendance.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true, cpf: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Lista todas as presenças de uma seção específica.
   */
  async findSectionAttendances(sectionId) {
    return prisma.sectionAttendance.findMany({
      where: { sectionId },
      include: {
        user: { select: { id: true, name: true, email: true, cpf: true } }
      }
    });
  }

  /**
   * Obtém todos os participantes (inscritos) do evento, incluindo dados do usuário.
   */
  async findEventParticipants(eventId) {
    return prisma.eventParticipant.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true, email: true, cpf: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new CheckinRepository();