// src/controllers/participantController.js
import { prisma } from "../config/db.js"
import participantService from '../services/participantService.js'
import eventService from '../services/eventService.js'
import subEventService from '../services/subEventService.js'
import eventRoleService from "../services/eventRoleService.js"

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
    const { eventId } = req.params;
    const requesterId = req.user.id;

    const event = await eventService.getById(eventId);
    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Evento não encontrado' });
    }

    
    if (event.capacity) {
      const currentCount = await prisma.eventParticipant.count({
        where: { eventId }
      });
      
      if (currentCount >= event.capacity) {
        return res.status(409).json({
          status: 'fail',
          message: 'Evento lotado! Não há mais vagas disponíveis.'
        });
      }
    }

    const manager = await isManager(requesterId, eventId, event.createdBy);
    const targetUserId = manager && req.body.userId ? req.body.userId : requesterId;

    // Verificar se já está inscrito
    const existing = await prisma.eventParticipant.findFirst({
      where: { userId: targetUserId, eventId }
    });

    if (existing) {
      return res.status(409).json({
        status: 'fail',
        message: 'Usuário já está inscrito neste evento'
      });
    }

    //verifica se o usuario é moderador ou membro do evento, se for não pode se inscrever como participante
    // Verifica se o usuário é moderador ou membro do evento
    const permission = await eventRoleService.isModeratorOrMember(targetUserId, eventId);
    if (permission) {
        return res.status(403).json({
            status: 'fail',
            message: 'Moderadores e membros da equipe não podem se inscrever como participantes'
        });
    }

    const participant = await participantService.addEventParticipant(eventId, targetUserId);

    // Se o participante for adicionado com sucesso, criar confirmação de presença = false;
    await eventService.createAttendance(eventId, targetUserId);

    res.status(201).json({ status: 'success', data: { participant } });

  } catch (error) {
    const alreadyEnrolled = error.message.includes('já está inscrito');
    console.error('Erro ao adicionar participante:', error);
    res.status(alreadyEnrolled ? 409 : 500).json({
      status: alreadyEnrolled ? 'fail' : 'error',
      message: error.message || 'Erro ao adicionar participante'
    });
  }
};

export const checkEventEnrollment = async (req, res) => {
  try {
    const { eventId } = req.params
    const userId = req.user.id

    const participant = await prisma.eventParticipant.findFirst({
      where: { 
        userId: userId, 
        eventId: eventId 
      }
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


export const deleteEventParticipantByUserAndEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: 'fail',
                message: 'userId é obrigatório'
            });
        }

        // Usa o service que remove evento principal + seções
        await participantService.removeEventParticipantWithSections(eventId, userId);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao cancelar inscrição:', error);
        if (error.message === 'Inscrição não encontrada') {
            return res.status(404).json({
                status: 'fail',
                message: error.message
            });
        }
        res.status(500).json({
            status: 'error',
            message: 'Erro ao cancelar inscrição'
        });
    }
};

export const inviteParticipantByEmail = async (req, res) => {
  try {
    const { eventId } = req.params
    const { name, email } = req.body
    if (!email || !name) {
      return res.status(400).json({ status: 'fail', message: 'Nome e email são obrigatórios' })
    }
    const participant = await participantService.inviteParticipantByEmail(eventId, name, email)
    res.status(201).json({ status: 'success', data: { participant } })
  }
    catch (error) {
      console.error('Erro ao adicionar participante por email:', error)
      res.status(500).json({ status: 'error', message: 'Erro ao adicionar participante por email' })
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

// src/controllers/participantController.js

export const addSubeventParticipant = async (req, res) => {
  try {
    const { subEventId } = req.params
    const requesterId = req.user.id
    
    const subEvent = await prisma.subEvent.findUnique({
      where: { id: subEventId },
      include: {
        event: true  
      }
    })

    if (!subEvent) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'Subevento não encontrado' 
      })
    }

   
    const event = await eventService.getById(subEvent.eventId)
    if (!event) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'Evento pai não encontrado' 
      })
    }

    const manager = await isManager(requesterId, subEvent.eventId, event.createdBy)

    const targetUserId = manager && req.body.userId ? req.body.userId : requesterId

    // Usuário comum precisa estar inscrito no evento principal
    if (!manager) {
      const enrolledInEvent = await prisma.eventParticipant.findFirst({
        where: { 
          userId: targetUserId, 
          eventId: subEvent.eventId 
        }
      })
      
      if (!enrolledInEvent) {
        return res.status(403).json({
          status: 'fail',
          message: 'Você precisa estar inscrito no evento principal para participar de atividades'
        })
      }
    }

    const participant = await participantService.addSubeventParticipant(subEventId, targetUserId)


    res.status(201).json({ 
      status: 'success', 
      data: { participant } 
    })

  } catch (error) {
    const alreadyEnrolled = error.message?.includes('já está inscrito')
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



export const checkSubeventEnrollment = async (req, res) => {
  try {
    const subEventId = req.params.subEventId;
    const userId = req.user.id;

    if (!subEventId) {
      return res.status(400).json({ enrolled: false, error: "subEventId ausente" });
    }

    const participant = await prisma.subeventParticipant.findFirst({
      where: {
        userId,
        subEventId,
      }
    });

    res.status(200).json({ enrolled: !!participant });
  } catch (error) {
    console.error('Erro ao checar inscrição no subevento:', error);
    res.status(500).json({ enrolled: false, error: error.message });
  }
};


export const getMyParticipations = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await prisma.eventParticipant.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        event: {
          date_start: 'asc'
        }
      }
    });

    const events = participations.map(p => ({
      id: p.event.id,
      title: p.event.title,
      description: p.event.description,
      date_start: p.event.date_start,
      date_end: p.event.date_end,
      location: p.event.location,
      category: p.event.category,
      organizer: p.event.creator,
      isPublic: p.event.isPublic,
      createdAt: p.createdAt
    }));

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: { events }
    });

  } catch (error) {
    console.error('Erro ao buscar participações:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar participações'
    });
  }
};