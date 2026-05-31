// src/services/sectionService.js
import SectionRepository from '../repository/SectionRepository.js'
import subEventService from './subEventService.js'

const sectionService = {
  async create(title, date_start, date_end, location, capacity, subEventId) {
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('SubEvento não encontrado')
    }

    if (new Date(date_start) > new Date(date_end)) {
      throw new Error('Data de início não pode ser maior que data de término')
    }

    const section = await SectionRepository.create({
      title: title || null,
      date_start: new Date(date_start),
      date_end: new Date(date_end),
      location: location || null,
      capacity: capacity ? parseInt(capacity) : null,
      subEventId
    })

    return section
  },

  async getById(id) {
    const section = await SectionRepository.findById(id)
    if (!section) {
      throw new Error('Seção não encontrada')
    }
    return section
  },

  async getAllBySubEventId(subEventId, userId = null) {
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('SubEvento não encontrado')
    }

    const sections = await SectionRepository.findAllBySubEventId(subEventId)
    
    // Se userId fornecido, adiciona informação se usuário está inscrito
    if (userId) {
      const userParticipations = await SectionRepository.getUserParticipationsBySubEvent(subEventId, userId)
      const participationMap = {}
      userParticipations.forEach(p => {
        participationMap[p.sectionId] = p.isEnrolled
      })
      
      return sections.map(section => ({
        ...section,
        isEnrolled: participationMap[section.id] || false,
        enrolledCount: section._count?.participants || 0,
        availableSpots: section.capacity 
          ? Math.max(0, section.capacity - (section._count?.participants || 0))
          : null
      }))
    }
    
    return sections
  },

  async update(id, updates) {
    const existingSection = await SectionRepository.findById(id)
    if (!existingSection) {
      throw new Error('Seção não encontrada')
    }

    const dataToUpdate = {}

    if (updates.title !== undefined) {
      dataToUpdate.title = updates.title?.trim() || null
    }

    if (updates.date_start !== undefined) {
      const newDateStart = new Date(updates.date_start)
      dataToUpdate.date_start = newDateStart
    }

    if (updates.date_end !== undefined) {
      const newDateEnd = new Date(updates.date_end)
      dataToUpdate.date_end = newDateEnd
    }

    if (updates.location !== undefined) {
      dataToUpdate.location = updates.location?.trim() || null
    }

    if (updates.capacity !== undefined) {
      dataToUpdate.capacity = updates.capacity ? parseInt(updates.capacity) : null
    }

    const finalDateStart = dataToUpdate.date_start || existingSection.date_start
    const finalDateEnd = dataToUpdate.date_end || existingSection.date_end

    if (finalDateStart > finalDateEnd) {
      throw new Error('Data de início não pode ser maior que data de término')
    }

    const section = await SectionRepository.update(id, dataToUpdate)
    return section
  },

  async delete(id) {
    const existingSection = await SectionRepository.findById(id)
    if (!existingSection) {
      throw new Error('Seção não encontrada')
    }

    await SectionRepository.delete(id)
    return true
  },

  async deleteAllBySubEventId(subEventId) {
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('SubEvento não encontrado')
    }

    const count = await SectionRepository.countBySubEventId(subEventId)
    await SectionRepository.deleteManyBySubEventId(subEventId)
    return count
  },

  async validateSectionDates(date_start, date_end) {
    if (new Date(date_start) > new Date(date_end)) {
      throw new Error('Data de início não pode ser maior que data de término')
    }
    return true
  },

  // ── NOVOS MÉTODOS PARA INSCRIÇÃO ──
  async enrollInSection(sectionId, userId) {
    const section = await SectionRepository.findById(sectionId)
    if (!section) {
      throw new Error('Seção não encontrada')
    }

    // Verificar capacidade
    if (section.capacity) {
      const participantCount = await SectionRepository.countParticipants(sectionId)
      if (participantCount >= section.capacity) {
        throw new Error('Esta seção está lotada')
      }
    }

    // Verificar se já está inscrito
    const existing = await SectionRepository.findParticipant(sectionId, userId)
    if (existing) {
      throw new Error('Usuário já está inscrito nesta seção')
    }

    return SectionRepository.addParticipant(sectionId, userId)
  },

  async leaveSection(sectionId, userId) {
    const participant = await SectionRepository.findParticipant(sectionId, userId)
    if (!participant) {
      throw new Error('Você não está inscrito nesta seção')
    }

    return SectionRepository.removeParticipant(sectionId, userId)
  },

  async checkEnrollment(sectionId, userId) {
    const participant = await SectionRepository.findParticipant(sectionId, userId)
    return !!participant
  },

  async getSectionParticipants(sectionId) {
    const participants = await SectionRepository.getSectionParticipants(sectionId)
    return participants
  },

  async createAttendance(sectionId, userId) {
    return SectionRepository.createAttendance(sectionId, userId)
  },

  async confirmAttendance(sectionId, userId) {
    return SectionRepository.confirmAttendance(sectionId, userId)
  }

}

export default sectionService