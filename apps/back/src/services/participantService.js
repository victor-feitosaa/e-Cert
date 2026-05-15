// src/services/participantService.js
import ParticipantRepository from '../repository/ParticipantRepository.js'
import eventService from './eventService.js'
import subEventService from './subEventService.js'

class ParticipantService {
  // Event Participants
  async addEventParticipant(eventId, name, email) {
    // Verificar se o evento existe
    const event = await eventService.getById(eventId)
    if (!event) {
      throw new Error('Evento não encontrado')
    }

    // Verificar se o participante já existe
    const existing = await ParticipantRepository.findEventParticipantByEmail(eventId, email)
    if (existing) {
      throw new Error('Este e-mail já está cadastrado neste evento')
    }

    return ParticipantRepository.createEventParticipant(eventId, name, email)
  }

  async getEventParticipants(eventId, search = '') {
    const event = await eventService.getById(eventId)
    if (!event) {
      throw new Error('Evento não encontrado')
    }

    return ParticipantRepository.findEventParticipants(eventId, search)
  }

  async getEventParticipantById(id) {
    const participant = await ParticipantRepository.findEventParticipantById(id)
    if (!participant) {
      throw new Error('Participante não encontrado')
    }
    return participant
  }

  async updateEventParticipant(id, data) {
    const participant = await ParticipantRepository.findEventParticipantById(id)
    if (!participant) {
      throw new Error('Participante não encontrado')
    }

    return ParticipantRepository.updateEventParticipant(id, data)
  }

  async removeEventParticipant(id) {
    const participant = await ParticipantRepository.findEventParticipantById(id)
    if (!participant) {
      throw new Error('Participante não encontrado')
    }

    return ParticipantRepository.deleteEventParticipant(id)
  }

  async countEventParticipants(eventId) {
    return ParticipantRepository.countEventParticipants(eventId)
  }

  // SubEvent Participants
  async addSubeventParticipant(subEventId, name, email) {
    // Verificar se o subevento existe
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('Subevento não encontrado')
    }

    // Verificar se o participante já existe
    const existing = await ParticipantRepository.findSubeventParticipantByEmail(subEventId, email)
    if (existing) {
      throw new Error('Este e-mail já está cadastrado neste subevento')
    }

    return ParticipantRepository.createSubeventParticipant(subEventId, name, email)
  }

  async getSubeventParticipants(subEventId, search = '') {
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      throw new Error('Subevento não encontrado')
    }

    return ParticipantRepository.findSubeventParticipants(subEventId, search)
  }

  async getSubeventParticipantById(id) {
    const participant = await ParticipantRepository.findSubeventParticipantById(id)
    if (!participant) {
      throw new Error('Participante não encontrado')
    }
    return participant
  }

  async updateSubeventParticipant(id, data) {
    const participant = await ParticipantRepository.findSubeventParticipantById(id)
    if (!participant) {
      throw new Error('Participante não encontrado')
    }

    return ParticipantRepository.updateSubeventParticipant(id, data)
  }

  async removeSubeventParticipant(id) {
    const participant = await ParticipantRepository.findSubeventParticipantById(id)
    if (!participant) {
      throw new Error('Participante não encontrado')
    }

    return ParticipantRepository.deleteSubeventParticipant(id)
  }

  async countSubeventParticipants(subEventId) {
    return ParticipantRepository.countSubeventParticipants(subEventId)
  }

  // Bulk operations
  async bulkAddEventParticipants(eventId, participants) {
    const results = []
    const errors = []

    for (const p of participants) {
      try {
        const result = await this.addEventParticipant(eventId, p.name, p.email)
        results.push(result)
      } catch (error) {
        errors.push({ email: p.email, error: error.message })
      }
    }

    return { results, errors }
  }

  async bulkAddSubeventParticipants(subEventId, participants) {
    const results = []
    const errors = []

    for (const p of participants) {
      try {
        const result = await this.addSubeventParticipant(subEventId, p.name, p.email)
        results.push(result)
      } catch (error) {
        errors.push({ email: p.email, error: error.message })
      }
    }

    return { results, errors }
  }
}

export default new ParticipantService()