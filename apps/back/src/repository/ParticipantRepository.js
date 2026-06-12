// src/repository/ParticipantRepository.js
import { prisma } from '../config/db.js'

class ParticipantRepository {

  // ── Event Participants ──────────────────────────────────────────────────────

  async createEventParticipant(eventId, userId) {
    return prisma.eventParticipant.create({
      data: { eventId, userId },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
  }

  async findEventParticipants(eventId, search = '') {
    return prisma.eventParticipant.findMany({
      where: {
        eventId,
        ...(search ? {
          user: {
            OR: [
              { name:  { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          }
        } : {})
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findEventParticipantById(id) {
    return prisma.eventParticipant.findUnique({
      where: { id },
      include: {
        user:  { select: { id: true, name: true, email: true } },
        event: true
      }
    })
  }

  async findEventParticipantByUserId(eventId, userId) {
    return prisma.eventParticipant.findUnique({
      where: { userId_eventId: { userId, eventId } }
    })
  }

  async deleteEventParticipant(id) {
    return prisma.eventParticipant.delete({ where: { id } })
  }

  async countEventParticipants(eventId) {
    return prisma.eventParticipant.count({ where: { eventId } })
  }

  // Buscar participação no evento principal por userId e eventId
async findEventParticipantByUserAndEvent(eventId, userId) {
    return prisma.eventParticipant.findUnique({
        where: { userId_eventId: { userId, eventId } }
    });
}

// Deletar participação no evento principal por ID
async deleteEventParticipantById(id) {
    return prisma.eventParticipant.delete({ where: { id } });
}

// Deletar todas as participações em seções de um evento para um usuário
async deleteAllSectionParticipationsForUserInEvent(eventId, userId) {
    return prisma.sectionParticipant.deleteMany({
        where: {
            userId: userId,
            section: {
                subEvent: {
                    eventId: eventId
                }
            }
        }
    });
}

async deleteEventAttendance(eventId, userId) {
    return prisma.eventAttendance.deleteMany({
        where: { userId, eventId }
    });
}

async deleteAllSectionAttendancesForUserInEvent(eventId, userId) {
    return prisma.sectionAttendance.deleteMany({
        where: {
            userId,
            section: {
                subEvent: {
                    eventId
                }
            }
        }
    });
}

  // ── SubEvent Participants ───────────────────────────────────────────────────

  async createSubeventParticipant(subEventId, userId) {
    return prisma.subeventParticipant.create({
      data: { subEventId, userId },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
  }

  async findSubeventParticipants(subEventId, search = '') {
    return prisma.subeventParticipant.findMany({
      where: {
        subEventId,
        ...(search ? {
          user: {
            OR: [
              { name:  { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          }
        } : {})
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findSubeventParticipantById(id) {
    return prisma.subeventParticipant.findUnique({
      where: { id },
      include: {
        user:     { select: { id: true, name: true, email: true } },
        subEvent: true
      }
    })
  }

  async findSubeventParticipantByUserId(subEventId, userId) {
    return prisma.subeventParticipant.findUnique({
      where: { userId_subEventId: { userId, subEventId } }
    })
  }

  async deleteSubeventParticipant(id) {
    return prisma.subeventParticipant.delete({ where: { id } })
  }

  async countSubeventParticipants(subEventId) {
    return prisma.subeventParticipant.count({ where: { subEventId } })
  }

  async findByEmailAndEventId(email, eventId) {
    return prisma.eventParticipant.findFirst({
      where: {
        eventId,
        user: {
          email
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })
  }
}

export default new ParticipantRepository()