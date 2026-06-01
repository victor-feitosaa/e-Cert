// src/services/participantService.js
import ParticipantRepository from '../repository/ParticipantRepository.js'
import eventService from './eventService.js'
import subEventService from './subEventService.js'

class ParticipantService {

  // ── Event Participants ──────────────────────────────────────────────────────

  async addEventParticipant(eventId, userId) {
    const event = await eventService.getById(eventId)
    if (!event) throw new Error('Evento não encontrado')

    // @@unique no schema já rejeita duplicata, mas checamos antes para mensagem legível
    const existing = await ParticipantRepository.findEventParticipantByUserId(eventId, userId)
    if (existing) throw new Error('Usuário já está inscrito neste evento')

    
    return ParticipantRepository.createEventParticipant(eventId, userId)
  }

  async getEventParticipants(eventId, search = '') {
    const event = await eventService.getById(eventId)
    if (!event) throw new Error('Evento não encontrado')
    return ParticipantRepository.findEventParticipants(eventId, search)
  }

  async getEventParticipantById(id) {
    const participant = await ParticipantRepository.findEventParticipantById(id)
    if (!participant) throw new Error('Participante não encontrado')
    return participant
  }

  async removeEventParticipant(id) {
    const participant = await ParticipantRepository.findEventParticipantById(id)
    if (!participant) throw new Error('Participante não encontrado')
    return ParticipantRepository.deleteEventParticipant(id)
  }

  async countEventParticipants(eventId) {
    return ParticipantRepository.countEventParticipants(eventId)
  }

  async isEventParticipant(eventId, userId) {
    const participant = await ParticipantRepository.findEventParticipantByUserId(eventId, userId)
    return !!participant
  }
    

  // ── SubEvent Participants ───────────────────────────────────────────────────
//não esta em uso ja que foi mudado para inscrição por sections
  async addSubeventParticipant(subEventId, userId) {
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) throw new Error('Subevento não encontrado')

    const existing = await ParticipantRepository.findSubeventParticipantByUserId(subEventId, userId)
    if (existing) throw new Error('Usuário já está inscrito neste subevento')

    return ParticipantRepository.createSubeventParticipant(subEventId, userId)
  }

  async getSubeventParticipants(subEventId, search = '') {
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) throw new Error('Subevento não encontrado')
    return ParticipantRepository.findSubeventParticipants(subEventId, search)
  }

  async getSubeventParticipantById(id) {
    const participant = await ParticipantRepository.findSubeventParticipantById(id)
    if (!participant) throw new Error('Participante não encontrado')
    return participant
  }

  async removeSubeventParticipant(id) {
    const participant = await ParticipantRepository.findSubeventParticipantById(id)
    if (!participant) throw new Error('Participante não encontrado')
    return ParticipantRepository.deleteSubeventParticipant(id)
  }

  async countSubeventParticipants(subEventId) {
    return ParticipantRepository.countSubeventParticipants(subEventId)
  }
}

export default new ParticipantService()