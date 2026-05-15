// src/repository/ParticipantRepository.js
import { prisma } from '../config/db.js'

class ParticipantRepository {
  // Event Participants
  async createEventParticipant(eventId, name, email) {
    return prisma.eventParticipant.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        eventId,
      }
    })
  }

  async findEventParticipants(eventId, search = '') {
    const where = { eventId }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    return prisma.eventParticipant.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findEventParticipantById(id) {
    return prisma.eventParticipant.findUnique({
      where: { id },
      include: { event: true }
    })
  }

  async findEventParticipantByEmail(eventId, email) {
    return prisma.eventParticipant.findFirst({
      where: {
        eventId,
        email: email.trim().toLowerCase()
      }
    })
  }

  async updateEventParticipant(id, data) {
    const updateData = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
    
    return prisma.eventParticipant.update({
      where: { id },
      data: updateData
    })
  }

  async deleteEventParticipant(id) {
    return prisma.eventParticipant.delete({
      where: { id }
    })
  }

  async countEventParticipants(eventId) {
    return prisma.eventParticipant.count({
      where: { eventId }
    })
  }

  // SubEvent Participants
  async createSubeventParticipant(subEventId, name, email) {
    return prisma.subeventParticipant.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subEventId,
      }
    })
  }

  async findSubeventParticipants(subEventId, search = '') {
    const where = { subEventId }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    return prisma.subeventParticipant.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
  }

  async findSubeventParticipantById(id) {
    return prisma.subeventParticipant.findUnique({
      where: { id },
      include: { subEvent: true }
    })
  }

  async findSubeventParticipantByEmail(subEventId, email) {
    return prisma.subeventParticipant.findFirst({
      where: {
        subEventId,
        email: email.trim().toLowerCase()
      }
    })
  }

  async updateSubeventParticipant(id, data) {
    const updateData = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
    
    return prisma.subeventParticipant.update({
      where: { id },
      data: updateData
    })
  }

  async deleteSubeventParticipant(id) {
    return prisma.subeventParticipant.delete({
      where: { id }
    })
  }

  async countSubeventParticipants(subEventId) {
    return prisma.subeventParticipant.count({
      where: { subEventId }
    })
  }
}

export default new ParticipantRepository()