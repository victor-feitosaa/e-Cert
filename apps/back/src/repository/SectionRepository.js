// src/repository/SectionRepository.js
import { prisma } from '../config/db.js'

const SectionRepository = {
  async create(data) {
    return prisma.section.create({
      data: {
        title: data.title,
        date_start: data.date_start,
        date_end: data.date_end,
        location: data.location,
        capacity: data.capacity, // ← NOVO
        subEventId: data.subEventId,
      }
    })
  },

  async findById(id) {
    return prisma.section.findUnique({
      where: { id },
      include: {
        subEvent: {
          include: {
            event: true
          }
        },
        participants: { // ← NOVO
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
  },

  async findAllBySubEventId(subEventId) {
    return prisma.section.findMany({
      where: { subEventId },
      orderBy: { date_start: 'asc' },
      include: {
        _count: { // ← NOVO: conta participantes
          select: { participants: true }
        }
      }
    })
  },

  async update(id, data) {
    return prisma.section.update({
      where: { id },
      data: {
        title: data.title,
        date_start: data.date_start,
        date_end: data.date_end,
        location: data.location,
        capacity: data.capacity, // ← NOVO
      }
    })
  },

  async delete(id) {
    return prisma.section.delete({
      where: { id }
    })
  },

  async deleteManyBySubEventId(subEventId) {
    return prisma.section.deleteMany({
      where: { subEventId }
    })
  },

  async countBySubEventId(subEventId) {
    return prisma.section.count({
      where: { subEventId }
    })
  },

  // ── NOVOS MÉTODOS PARA PARTICIPANTES ──
  async addParticipant(sectionId, userId) {
    return prisma.sectionParticipant.create({
      data: {
        userId,
        sectionId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  async removeParticipant(sectionId, userId) {
    return prisma.sectionParticipant.delete({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      }
    })
  },

  async findParticipant(sectionId, userId) {
    return prisma.sectionParticipant.findUnique({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      }
    })
  },

  async countParticipants(sectionId) {
    return prisma.sectionParticipant.count({
      where: { sectionId }
    })
  },

  async getUserParticipationsBySubEvent(subEventId, userId) {
    const sections = await prisma.section.findMany({
      where: { subEventId },
      include: {
        participants: {
          where: { userId },
          select: { id: true }
        }
      }
    })
    
    return sections.map(section => ({
      sectionId: section.id,
      isEnrolled: section.participants.length > 0
    }))
  },

  async getSectionParticipants(sectionId) {
    return prisma.sectionParticipant.findMany({
      where: { sectionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  // Em sectionService.js
  async createAttendance(sectionId, userId) {
      return prisma.sectionAttendance.upsert({
          where: { userId_sectionId: { userId, sectionId } },
          update: { attended: false },
          create: { userId, sectionId, attended: false }
      });
  },

  async deleteAttendance(sectionId, userId) {
      return prisma.sectionAttendance.delete({
          where: { userId_sectionId: { userId, sectionId } }
      });
  },

  async confirmAttendance(sectionId, userId) {
    return prisma.sectionAttendance.update({
      where: {
        userId_sectionId: {
          userId,
          sectionId
        }
      },
      data: {
        attended: true
      }
    })
  }
}

export default SectionRepository