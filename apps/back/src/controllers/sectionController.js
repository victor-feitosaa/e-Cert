// src/controllers/sectionController.js
import { prisma } from '../config/db.js'
import sectionService from '../services/sectionService.js'
import subEventService from '../services/subEventService.js'
import eventMemberService from '../services/eventMemberService.js'
import participantService from '../services/participantService.js'
import eventService from '../services/eventService.js'

export const createSection = async (req, res) => {
  try {
    const { subEventId } = req.params
    const { title, date_start, date_end, location, capacity } = req.body
    const userId = req.user.id

    // Verificar se o subEvento existe
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'SubEvento não encontrado'
      })
    }

    // Verificar permissão
    if (subEvent.createdBy !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para adicionar seções neste subevento'
      })
    }

    // Validações básicas
    if (!date_start) {
      return res.status(400).json({
        status: 'fail',
        message: 'A data de início é obrigatória'
      })
    }

    if (!date_end) {
      return res.status(400).json({
        status: 'fail',
        message: 'A data de término é obrigatória'
      })
    }

    // Validar se data de início é anterior à data de término
    if (new Date(date_start) > new Date(date_end)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Data de início não pode ser maior que data de término'
      })
    }

    // Validar se as datas estão dentro do período do evento principal
    const event = await eventService.getById(subEvent.eventId)
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento principal não encontrado'
      })
    }

    if (!event.date_start || !event.date_end) {
      return res.status(400).json({
        status: 'fail',
        message: 'Evento principal não possui período definido. Defina as datas do evento primeiro.'
      })
    }

    const eventStart = new Date(event.date_start)
    const eventEnd = new Date(event.date_end)
    const sectionStart = new Date(date_start)
    const sectionEnd = new Date(date_end)

    
    if (sectionStart.getTime() < eventStart.getTime() || sectionEnd.getTime() > eventEnd.getTime()) {
      return res.status(400).json({
        status: 'fail',
        message: `As datas da seção devem estar entre ${eventStart.toLocaleDateString()} e ${eventEnd.toLocaleDateString()}`
      })
    }

    // Validar capacidade 
    if (capacity !== undefined && (isNaN(capacity) || capacity < 0)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Capacidade deve ser um número inteiro positivo'
      })
    }

    //capacity não pode ser maior que a do event
    if (capacity !== undefined && event.capacity !== null && capacity > event.capacity) {
      return res.status(400).json({
        status: 'fail',
        message: `Capacidade da seção não pode ser maior que a capacidade do evento principal (${event.capacity})`
      })
    }

    // Criar seção
    const section = await sectionService.create(
      title,
      new Date(date_start),
      new Date(date_end),
      location,
      capacity,
      subEventId
    )

    res.status(201).json({
      status: 'success',
      data: { section }
    })

  } catch (error) {
    console.error('Erro ao criar seção:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao criar seção'
    })
  }
}

export const getSections = async (req, res) => {
  try {
    const { subEventId } = req.params
    const userId = req.user?.id

    const sections = await sectionService.getAllBySubEventId(subEventId, userId)

    res.status(200).json({
      status: 'success',
      results: sections.length,
      data: { sections }
    })

  } catch (error) {
    console.error('Erro ao buscar seções:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar seções'
    })
  }
}

export const getSectionById = async (req, res) => {
  try {
    const { subEventId, id } = req.params

    const section = await sectionService.getById(id)

    if (!section) {
      return res.status(404).json({
        status: 'fail',
        message: 'Seção não encontrada'
      })
    }

    if (section.subEventId !== subEventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Seção não pertence a este subevento'
      })
    }

    res.status(200).json({
      status: 'success',
      data: { section }
    })

  } catch (error) {
    console.error('Erro ao buscar seção:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar seção'
    })
  }
}

export const getPublicSections = async (req, res) => {
  try {
    const { subEventId } = req.params

    if (!subEventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'subEventId é obrigatório'
      })
    }

    const sections = await prisma.section.findMany({
      where: { subEventId },
      orderBy: { date_start: 'asc' },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    })

    console.log(`✅ Encontradas ${sections.length} seções`)

    const publicSections = sections.map(section => ({
      id: section.id,
      title: section.title,
      date_start: section.date_start,
      date_end: section.date_end,
      location: section.location,
      capacity: section.capacity,
      enrolledCount: section._count.participants,
      availableSpots: section.capacity ? section.capacity - section._count.participants : null
    }))

    res.status(200).json({
      status: 'success',
      data: { sections: publicSections }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar seções públicas:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar seções públicas'
    })
  }
}

export const getUserSectionStatus = async (req, res) => {
  try {
    const { subEventId } = req.params
    const userId = req.user.id

    console.log("🔍 Buscando status do usuário para subevento:", subEventId)
    console.log("👤 Usuário:", userId)

    const sections = await prisma.section.findMany({
      where: { subEventId },
      include: {
        participants: {
          where: { userId },
          select: { id: true }
        }
      }
    })

    const enrolledSections = sections
      .filter(section => section.participants.length > 0)
      .map(section => section.id)

    console.log("✅ Seções inscritas:", enrolledSections)

    res.status(200).json({
      enrolledSections
    })

  } catch (error) {
    console.error('Erro ao buscar status das seções:', error)
    res.status(500).json({
      enrolledSections: [],
      error: error.message
    })
  }
}

export const updateSection = async (req, res) => {
  try {
    const { subEventId, id } = req.params
    const updates = req.body
    const userId = req.user.id

    const existingSection = await sectionService.getById(id)

    if (!existingSection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Seção não encontrada'
      })
    }

    if (existingSection.subEventId !== subEventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Seção não pertence a este subevento'
      })
    }

    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent || subEvent.createdBy !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para editar esta seção'
      })
    }

    const section = await sectionService.update(id, updates)

    res.status(200).json({
      status: 'success',
      data: { section }
    })

  } catch (error) {
    console.error('Erro ao atualizar seção:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao atualizar seção'
    })
  }
}

export const deleteSection = async (req, res) => {
  try {
    const { subEventId, id } = req.params
    const userId = req.user.id

    const existingSection = await sectionService.getById(id)

    const totalSections = await sectionService.getAllBySubEventId(subEventId, userId)
    if (totalSections.length <= 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Não é possível deletar a última seção de um subevento, deve haver pelo menos uma seção'
      })
    };

    if (!existingSection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Seção não encontrada'
      })
    }

    if (existingSection.subEventId !== subEventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Seção não pertence a este subevento'
      })
    }

    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent || subEvent.createdBy !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para deletar esta seção'
      })
    }

    await sectionService.delete(id)

    res.status(204).json({
      status: 'success',
      data: null
    })

  } catch (error) {
    console.error('Erro ao deletar seção:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar seção'
    })
  }
}

export const deleteAllSectionsFromSubEvent = async (req, res) => {
  try {
    const { subEventId } = req.params
    const userId = req.user.id

    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent || subEvent.createdBy !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para deletar seções deste subevento'
      })
    }

    const deletedCount = await sectionService.deleteAllBySubEventId(subEventId)

    res.status(200).json({
      status: 'success',
      message: `${deletedCount} seção(ões) deletada(s)`,
      data: { deletedCount }
    })

  } catch (error) {
    console.error('Erro ao deletar seções:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao deletar seções'
    })
  }
}

export const enrollInSection = async (req, res) => {
  try {
    const { subEventId, id } = req.params // id = sectionId
    const userId = req.user.id

    console.log("Inscrevendo usuário na seção:", { subEventId, sectionId: id, userId })

    // Verificar se o subEvento existe
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'SubEvento não encontrado'
      })
    }

    console.log("SubEvento encontrado:", subEvent)
    console.log("ID DO EVENTO PRINCIPAL:", subEvent.eventId)

    if (!subEvent.eventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Subevento não está vinculado a nenhum evento principal'
      })
    }

    const eventId = subEvent.eventId
    console.log("Buscando evento com ID:", eventId)

    const event = await eventService.getById(eventId)
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento principal não encontrado'
      })
    }

    console.log("Evento principal encontrado:", event.id)

    // Verificar se o usuário está inscrito no EVENTO PRINCIPAL
    const enrolledInEvent = await participantService.isEventParticipant(eventId, userId)
    console.log("Inscrito no evento principal:", enrolledInEvent)

    if (!enrolledInEvent) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você precisa estar inscrito no evento principal primeiro'
      })
    }

    // Verificar capacidade da seção
    const section = await sectionService.getById(id)
    if (!section) {
      return res.status(404).json({
        status: 'fail',
        message: 'Seção não encontrada'
      })
    }

    if (section.capacity) {
      const enrolledCount = await sectionService.getEnrolledCount(id)
      if (enrolledCount >= section.capacity) {
        return res.status(409).json({
          status: 'fail',
          message: 'Esta seção está lotada'
        })
      }
    }

    // Verificar se já está inscrito
    const alreadyEnrolled = await sectionService.checkEnrollment(id, userId)
    if (alreadyEnrolled) {
      return res.status(409).json({
        status: 'fail',
        message: 'Usuário já está inscrito nesta seção'
      })
    }

    // Inscrever na seção
    const participant = await sectionService.enrollInSection(id, userId)

    // Criar attendance (presença)
    await sectionService.createAttendance(id, userId)

    res.status(201).json({
      status: 'success',
      data: { participant }
    })

  } catch (error) {
    console.error('❌ Erro ao inscrever na seção:', error)

    if (error.message === 'Esta seção está lotada') {
      return res.status(409).json({
        status: 'fail',
        message: error.message
      })
    }

    if (error.message === 'Usuário já está inscrito nesta seção') {
      return res.status(409).json({
        status: 'fail',
        message: error.message
      })
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'Erro ao inscrever na seção'
    })
  }
}

export const confirmAttendance = async (req, res) => {
  try {
    const { subEventId, id } = req.params
    const userId = req.user.id

    console.log("Confirmando presença na seção:", { subEventId, sectionId: id, userId })

    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'SubEvento não encontrado'
      })
    }

    const event = await eventService.getById(subEvent.eventId)
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado'
      })
    }

    const isEnrolledInEvent = await participantService.isEventParticipant(event.id, userId)
    if (!isEnrolledInEvent) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você precisa estar inscrito no evento principal para confirmar presença'
      })
    }

    if (!await sectionService.checkEnrollment(id, userId)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você precisa estar inscrito nesta seção para confirmar presença'
      })
    }

 
     const now = new Date();
     const section = await sectionService.getById(id);
     if (now < new Date(section.date_start) || now > new Date(section.date_end)) {
       return res.status(400).json({
         status: 'fail',
         message: 'A confirmação de presença só pode ser feita durante ou após a seção'
       });
     }

    const attendance = await sectionService.confirmAttendance(id, userId)

    res.status(201).json({
      status: 'success',
      data: { attendance }
    })

  } catch (error) {
    console.error('Erro ao confirmar presença na seção:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao confirmar presença na seção'
    })
  }
}

export const leaveSection = async (req, res) => {
  try {
    const { subEventId, id } = req.params // id = sectionId
    const userId = req.user.id

    await sectionService.leaveSection(id, userId)

    res.status(204).send()

  } catch (error) {
    console.error('Erro ao sair da seção:', error)
    res.status(500).json({
      status: 'error',
      message: error.message || 'Erro ao sair da seção'
    })
  }
}

export const checkSectionEnrollment = async (req, res) => {
  try {
    const { subEventId, id } = req.params // id = sectionId
    const userId = req.user.id

    const isEnrolled = await sectionService.checkEnrollment(id, userId)

    res.status(200).json({ enrolled: isEnrolled })

  } catch (error) {
    console.error('Erro ao verificar inscrição na seção:', error)
    res.status(500).json({ enrolled: false, error: error.message })
  }
}

export const getSectionParticipants = async (req, res) => {
  try {
    const { subEventId, id } = req.params // id = sectionId
    const userId = req.user.id

    const participants = await sectionService.getParticipants(id, userId)

    res.status(200).json({
      status: 'success',
      results: participants.length,
      data: { participants }
    })

  } catch (error) {
    console.error('Erro ao buscar participantes da seção:', error)
    res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar participantes da seção'
    })
  }
}