// src/controllers/participantController.js
import participantService from '../services/participantService.js'
import eventService from '../services/eventService.js'
import subEventService from '../services/subEventService.js'

// Event Participants
export const addEventParticipant = async (req, res) => {
  try {
    const { eventId } = req.params
    const { name, email } = req.body
    const userId = req.user.id

    // Verificar permissão
    const event = await eventService.getById(eventId)
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado'
      })
    }

    if (event.createdBy !== userId) {
      // Verificar se é moderador
      const permission = await prisma.eventPermission.findFirst({
        where: {
          eventId,
          userId,
          role: { in: ['ORGANIZER', 'MODERATOR'] }
        }
      })
      
      if (!permission) {
        return res.status(403).json({
          status: 'fail',
          message: 'Você não tem permissão para adicionar participantes'
        })
      }
    }

    if (!name?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nome é obrigatório'
      })
    }

    if (!email?.trim() || !email.includes('@')) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-mail inválido'
      })
    }

    const participant = await participantService.addEventParticipant(eventId, name, email)

    res.status(201).json({
      status: 'success',
      data: { participant }
    })

  } catch (error) {
    console.error('Erro ao adicionar participante:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Erro ao adicionar participante'
    })
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
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar participantes'
    })
  }
}

export const getEventParticipantById = async (req, res) => {
  try {
    const { id } = req.params

    const participant = await participantService.getEventParticipantById(id)

    res.status(200).json({
      status: 'success',
      data: { participant }
    })

  } catch (error) {
    console.error('Erro ao buscar participante:', error)
    if (error.message === 'Participante não encontrado') {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar participante'
    })
  }
}

export const updateEventParticipant = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email } = req.body

    const participant = await participantService.updateEventParticipant(id, { name, email })

    res.status(200).json({
      status: 'success',
      data: { participant }
    })

  } catch (error) {
    console.error('Erro ao atualizar participante:', error)
    if (error.message === 'Participante não encontrado') {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar participante'
    })
  }
}

export const deleteEventParticipant = async (req, res) => {
  try {
    const { id } = req.params

    await participantService.removeEventParticipant(id)

    res.status(204).send()

  } catch (error) {
    console.error('Erro ao remover participante:', error)
    if (error.message === 'Participante não encontrado') {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover participante'
    })
  }
}

export const bulkAddEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params
    const { participants } = req.body

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Lista de participantes é obrigatória'
      })
    }

    const results = await participantService.bulkAddEventParticipants(eventId, participants)

    res.status(201).json({
      status: 'success',
      data: {
        added: results.results.length,
        errors: results.errors
      }
    })

  } catch (error) {
    console.error('Erro ao adicionar participantes em lote:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao adicionar participantes'
    })
  }
}

// SubEvent Participants
export const addSubeventParticipant = async (req, res) => {
  try {
    const { subEventId } = req.params
    const { name, email } = req.body
    const userId = req.user.id

    // Verificar permissão
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'Subevento não encontrado'
      })
    }

    const event = await eventService.getById(subEvent.eventId)
    if (event.createdBy !== userId) {
      const permission = await prisma.eventPermission.findFirst({
        where: {
          eventId: subEvent.eventId,
          userId,
          role: { in: ['ORGANIZER', 'MODERATOR'] }
        }
      })
      
      if (!permission) {
        return res.status(403).json({
          status: 'fail',
          message: 'Você não tem permissão para adicionar participantes'
        })
      }
    }

    if (!name?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nome é obrigatório'
      })
    }

    if (!email?.trim() || !email.includes('@')) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-mail inválido'
      })
    }

    const participant = await participantService.addSubeventParticipant(subEventId, name, email)

    res.status(201).json({
      status: 'success',
      data: { participant }
    })

  } catch (error) {
    console.error('Erro ao adicionar participante do subevento:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Erro ao adicionar participante'
    })
  }
}

export const getSubeventParticipants = async (req, res) => {
  try {
    const { subEventId } = req.params
    const { search } = req.query

    const participants = await participantService.getSubeventParticipants(subEventId, search)

    res.status(200).json({
      status: 'success',
      results: participants.length,
      data: { participants }
    })

  } catch (error) {
    console.error('Erro ao buscar participantes do subevento:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar participantes'
    })
  }
}

export const deleteSubeventParticipant = async (req, res) => {
  try {
    const { id } = req.params

    await participantService.removeSubeventParticipant(id)

    res.status(204).send()

  } catch (error) {
    console.error('Erro ao remover participante do subevento:', error)
    if (error.message === 'Participante não encontrado') {
      return res.status(404).json({
        status: 'fail',
        message: error.message
      })
    }
    res.status(500).json({
      status: 'error',
      message: 'Erro ao remover participante'
    })
  }
}