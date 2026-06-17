// src/repository/CheckinRepository.js
import { prisma } from '../config/db.js';

class CheckinRepository {
  /**
   * Verifica permissão de check-in para um usuário em um evento.
   * Retorna { allowed: boolean, reason: string, role?: string }
   */
  async findCheckinPermission(userId, eventId) {
    // 1) É organizador?
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdBy: true }
    });
    if (event?.createdBy === userId) {
      return { allowed: true, reason: 'organizer' };
    }

    // 2) Tem permissão direta (CHECKIN ou MODERATOR)
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

  async findEventById(eventId) {
    return prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, date_start: true, date_end: true }
    });
  }

  async findEventParticipantById(participantId) {
    return prisma.eventParticipant.findUnique({
      where: { id: participantId },
      include: { user: { select: { id: true, name: true, email: true, cpf: true } } }
    });
  }

  async findEventParticipantByUserAndEvent(userId, eventId) {
    return prisma.eventParticipant.findFirst({
      where: { userId, eventId },
      include: { user: { select: { id: true, name: true, email: true, cpf: true } } }
    });
  }

  async upsertEventAttendance(eventId, userId) {
    return prisma.eventAttendance.upsert({
      where: { userId_eventId: { userId, eventId } },
      update: { attended: true },
      create: { userId, eventId, attended: true }
    });
  }

  async upsertSectionAttendance(sectionId, userId) {
    return prisma.sectionAttendance.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      update: { attended: true },
      create: { userId, sectionId, attended: true }
    });
  }

  async findEventAttendances(eventId) {
    return prisma.eventAttendance.findMany({
      where: { eventId },
      select: { userId: true, attended: true, updatedAt: true }
    });
  }

  async findSectionAttendancesByEvent(eventId) {
    // Busca todas as seções do evento e suas presenças
    const sections = await prisma.section.findMany({
      where: { subEvent: { eventId } },
      select: { id: true }
    });
    const sectionIds = sections.map(s => s.id);
    if (sectionIds.length === 0) return [];

    return prisma.sectionAttendance.findMany({
      where: { sectionId: { in: sectionIds } },
      select: { userId: true, sectionId: true, attended: true }
    });
  }

  async findEventParticipants(eventId) {
    return prisma.eventParticipant.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true, cpf: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Verifica se o usuário já fez check-in no evento principal
  async findEventAttendance(userId, eventId) {
    return prisma.eventAttendance.findUnique({
      where: { userId_eventId: { userId, eventId } }
    });
  }

  // Verifica inscrição em seção
  async findSectionEnrollment(userId, sectionId) {
    return prisma.sectionParticipant.findUnique({
      where: { userId_sectionId: { userId, sectionId } }
    });
  }
}

export default new CheckinRepository();