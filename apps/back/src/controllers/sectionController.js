// src/controllers/sectionController.js
import { prisma } from '../config/db.js'
import sectionService from '../services/sectionService.js'
import subEventService from '../services/subEventService.js'

export const createSection = async (req, res) => {
  try {
    // ✅ Apenas subEventId vem da URL
    const { subEventId } = req.params
    const { title, date_start, date_end, location } = req.body
    const userId = req.user.id

    console.log("📝 Criando seção para subEventId:", subEventId)

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

    // Validações
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

    // Validar datas
    if (new Date(date_start) > new Date(date_end)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Data de início não pode ser maior que data de término'
      })
    }

    // Criar seção
    const section = await sectionService.create(
      title,
      new Date(date_start),
      new Date(date_end),
      location,
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
    const userId = req.user.id  

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
    const { subEventId, id } = req.params  // id = sectionId
    const userId = req.user.id

    // Verificar se o subEvento existe
    const subEvent = await subEventService.findById(subEventId)
    if (!subEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'SubEvento não encontrado'
      })
    }

    // Verificar se o usuário está inscrito no evento principal
    const enrolledInEvent = await prisma.eventParticipant.findFirst({
      where: {
        userId: userId,
        eventId: subEvent.eventId
      }
    })

    if (!enrolledInEvent) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você precisa estar inscrito no evento principal primeiro'
      })
    }

    const participant = await sectionService.enrollInSection(id, userId)

    res.status(201).json({
      status: 'success',
      data: { participant }
    })

  } catch (error) {
    console.error('Erro ao inscrever na seção:', error)
    
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
      message: 'Erro ao inscrever na seção'
    })
  }
}

export const leaveSection = async (req, res) => {
  try {
    const { subEventId, id } = req.params  // id = sectionId
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
    const { subEventId, id } = req.params  // id = sectionId
    const userId = req.user.id

    const isEnrolled = await sectionService.checkEnrollment(id, userId)

    res.status(200).json({ enrolled: isEnrolled })

  } catch (error) {
    console.error('Erro ao verificar inscrição na seção:', error)
    res.status(500).json({ enrolled: false, error: error.message })
  }
}

