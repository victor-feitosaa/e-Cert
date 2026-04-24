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
        }
      }
    })
  },

  async findAllBySubEventId(subEventId) {
    return prisma.section.findMany({
      where: { subEventId },
      orderBy: { date_start: 'asc' }
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
  }
}

export default SectionRepository