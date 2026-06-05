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