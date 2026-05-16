// src/controllers/participantController.js
import { prisma } from "../config/db.js"
import participantService from '../services/participantService.js'
import eventService from '../services/eventService.js'
import subEventService from '../services/subEventService.js'

// ── helpers ──────────────────────────────────────────────────────────────────

const isManager = async (userId, eventId, createdBy) => {
  if (createdBy === userId) return true
  const permission = await prisma.eventPermission.findFirst({
    where: { eventId, userId, role: { in: ['ORGANIZER', 'MODERATOR'] } }
  })
  return !!permission
}

// ── Event Participants ────────────────────────────────────────────────────────

export const addEventParticipant = async (req, res) => {
  try {
    const { eventId } = req.params
    const requesterId = req.user.id

    const event = await eventService.getById(eventId)
    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Evento não encontrado' })
    }

    const manager = await isManager(requesterId, eventId, event.createdBy)

    // Managers podem especificar outro userId no body; usuário comum só se inscreve
    const targetUserId = manager && req.body.userId ? req.body.userId : requesterId

    const participant = await participantService.addEventParticipant(eventId, targetUserId)

    res.status(201).json({ status: 'success', data: { participant } })

  } catch (error) {
    const alreadyEnrolled = error.message.includes('já está inscrito')
    console.error('Erro ao adicionar participante:', error)
    res.status(alreadyEnrolled ? 409 : 500).json({
      status: alreadyEnrolled ? 'fail' : 'error',
      message: error.message || 'Erro ao adicionar participante'
    })
  }
}

export const checkEventEnrollment = async (req, res) => {
  try {
    const { eventId } = req.params
    const userId = req.user.id

    const participant = await prisma.eventParticipant.findUnique({
      where: { userId_eventId: { userId, eventId } }
    })

    res.status(200).json({ enrolled: !!participant })

  } catch (error) {
    console.error('Erro ao checar inscrição:', error)
    res.status(500).json({ status: 'error', message: 'Erro ao checar inscrição' })
  }
}

export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params
    const { search } = req.query

    const participants = await participantService.getEventParticipants(eventId, search)

    res.status(200).json({
      status: 'success',
      results: participants.length,
      data: { participants }
    })

  } catch (error) {
    console.error('Erro ao buscar participantes:', error)
    res.status(500).json({ status: 'error', message: 'Erro ao buscar participantes' })
  }
}

export const getEventParticipantById = async (req, res) => {
  try {
    const { id } = req.params
    const participant = await participantService.getEventParticipantById(id)
    res.status(200).json({ status: 'success', data: { participant } })
  } catch (error) {
    if (error.message === 'Participante não encontrado') {
      return res.status(404).json({ status: 'fail', message: error.message })
    }
    res.status(500).json({ status: 'error', message: 'Erro ao buscar participante' })
  }
}

export const deleteEventParticipant = async (req, res) => {
  try {
    const { id } = req.params
    await participantService.removeEventParticipant(id)
    res.status(204).send()
  } catch (error) {
    if (error.message === 'Participante não encontrado') {
      return res.status(404).json({ status: 'fail', message: error.message })
    }
    res.status(500).json({ status: 'error', message: 'Erro ao remover participante' })
  }
}

// bulk — agora recebe array de userIds
export const bulkAddEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params
    const { userIds } = req.body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Lista de userIds é obrigatória' })
    }

    const results = []
    const errors  = []

    for (const userId of userIds) {
      try {
        const result = await participantService.addEventParticipant(eventId, userId)
        results.push(result)
      } catch (err) {
        errors.push({ userId, error: err.message })
      }
    }

    res.status(201).json({ status: 'success', data: { added: results.length, errors } })

  } catch (error) {
    console.error('Erro ao adicionar participantes em lote:', error)
    res.status(500).json({ status: 'error', message: 'Erro ao adicionar participantes' })
  }
}

// ── SubEvent Participants ─────────────────────────────────────────────────────

export const addSubeventParticipant = async (req, res) => {
  try {
    const { subEventId } = req.params
    const requesterId = req.user.id

    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      return res.status(404).json({ status: 'fail', message: 'Subevento não encontrado' })
    }

    const event = await eventService.getById(subEvent.eventId)
    const manager = await isManager(requesterId, subEvent.eventId, event.createdBy)

    const targetUserId = manager && req.body.userId ? req.body.userId : requesterId

    // Usuário comum precisa estar inscrito no evento principal
    if (!manager) {
      const enrolledInEvent = await prisma.eventParticipant.findUnique({
        where: { userId_eventId: { userId: targetUserId, eventId: subEvent.eventId } }
      })
      if (!enrolledInEvent) {
        return res.status(403).json({
          status: 'fail',
          message: 'Você precisa estar inscrito no evento principal para participar de atividades'
        })
      }
    }

    const participant = await participantService.addSubeventParticipant(subEventId, targetUserId)

    res.status(201).json({ status: 'success', data: { participant } })

  } catch (error) {
    const alreadyEnrolled = error.message.includes('já está inscrito')
    console.error('Erro ao adicionar participante do subevento:', error)
    res.status(alreadyEnrolled ? 409 : 500).json({
      status: alreadyEnrolled ? 'fail' : 'error',
      message: error.message || 'Erro ao adicionar participante'
    })
  }
}

export const getSubeventParticipants = async (req, res) => {
  try {
    const { subEventId } = req.params
    const { search } = req.query
    const participants = await participantService.getSubeventParticipants(subEventId, search)
    res.status(200).json({ status: 'success', results: participants.length, data: { participants } })
  } catch (error) {
    console.error('Erro ao buscar participantes do subevento:', error)
    res.status(500).json({ status: 'error', message: 'Erro ao buscar participantes' })
  }
}

export const deleteSubeventParticipant = async (req, res) => {
  try {
    const { id } = req.params
    await participantService.removeSubeventParticipant(id)
    res.status(204).send()
  } catch (error) {
    if (error.message === 'Participante não encontrado') {
      return res.status(404).json({ status: 'fail', message: error.message })
    }
    res.status(500).json({ status: 'error', message: 'Erro ao remover participante' })
  }
}