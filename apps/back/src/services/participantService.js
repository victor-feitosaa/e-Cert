// src/services/participantService.js
import ParticipantRepository from '../repository/ParticipantRepository.js'
import UserRepository from '../repository/UserRepository.js'
import emailService from './emailService.js'
import eventService from './eventService.js'
import subEventService from './subEventService.js'

class ParticipantService {

  // ── Event Participants ──────────────────────────────────────────────────────

  async addEventParticipant(eventId, userId) {
    const event = await eventService.getById(eventId)
    if (!event) throw new Error('Evento não encontrado')

    const existing = await ParticipantRepository.findEventParticipantByUserId(eventId, userId)
    if (existing) throw new Error('Usuário já está inscrito neste evento')

    const participant = await ParticipantRepository.createEventParticipant(eventId, userId)

    if (participant){
      await emailService.sendEmail(
        participant.user.email,
        `Confirmação de inscrição: ${event.title}`,
        `<h2>Você se inscreveu com sucesso no evento!</h2>
        <p><strong>Evento:</strong> ${event.title}</p>
        <p>Agradecemos por se inscrever. Fique atento para mais informações sobre o evento.</p>
        <a href="${process.env.FRONTEND_URL}/eventPage?id=${event.id}">Ver detalhes do evento</a>`
      );
    }

    return participant
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

  async findByEmailAndEventId(email, eventId) {
    return await ParticipantRepository.findByEmailAndEventId(email, eventId);
  }
    
    async inviteParticipantByEmail(eventId, name, email) {
    const event = await eventService.getById(eventId)
    if (!event) throw new Error('Evento não encontrado')

    const existing = await ParticipantRepository.findByEmailAndEventId(email, eventId)
    if (existing) throw new Error('Usuário já está inscrito neste evento')

    let isNewUser = false
    let user = await UserRepository.findByEmail(email)
    if (!user) {
      isNewUser = true
      const randomPassword = Math.random().toString(36).slice(-8)
      user = await UserRepository.create(name, email, randomPassword, null, 'PARCIAL')
    }

    const participant = await ParticipantRepository.createEventParticipant(eventId, user.id)

    if (participant) {
      await emailService.sendEmail(
        email,
        `Convite para evento: ${event.title}`,
        `<h2>Você foi convidado para participar do evento!</h2>
        <p><strong>Evento:</strong> ${event.title}</p>
        <p><strong>Função:</strong> Participante</p>
        ${isNewUser ? `<p>Uma conta foi criada para você com a senha: <strong>${user.password}</strong>. Por favor, faça login e altere sua senha.</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/eventPage?id=${event.id}">Ver detalhes do evento</a>`
      );
    }
    return participant
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