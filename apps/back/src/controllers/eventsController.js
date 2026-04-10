import { prisma } from '../config/db.js';
import EventRoleService from '../services/EventRoleService.js';
import eventService from '../services/eventService.js';


// Helper para validação de datas
const validateEventDates = (eventData) => {
  const errors = [];
  
  if (eventData.date && new Date(eventData.date) < new Date()) {
    errors.push('A data do evento não pode ser no passado');
  }
  
  if (eventData.registrationEndDate && eventData.date) {
    const regEnd = new Date(eventData.registrationEndDate);
    const eventDate = new Date(eventData.date);
    
    if (regEnd > eventDate) {
      errors.push('A data limite de inscrição não pode ser depois da data do evento');
    }
  }
  
  return errors;
};

export const createEvent = async (req, res) => {
  try {
    // 1. VERIFICAÇÃO SUPER EXPLÍCITA
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Middleware de autenticação não executado ou falhou'
      });
    }

    if (!req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'ID do usuário não encontrado no token'
      });
    }

    const { title, description, date, location, isPublic } = req.body;

    // 2. VALIDAÇÕES
    if (!title?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Título é obrigatório'
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Descrição é obrigatória'
      });
    }

    if (!date) {
      return res.status(400).json({
        status: 'fail',
        message: 'Data é obrigatória'
      });
    }

    // 3. Validar data
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Data inválida. Use formato YYYY-MM-DD'
      });
    }

    // 4. CRIAR EVENTO 
  
    const event = await eventService.create(title, description, eventDate, location, isPublic, req.user.id) 

    //transformar automaticamente em organizer do evento
    await EventRoleService.assignOrganizerRole(req.user.id, event.id);

    
    res.status(201).json({
      status: 'success',
      data: { event }
    });

  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
    
    // Erro específico do Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({
        status: 'fail',
        message: 'Já existe um evento com este título'
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        status: 'fail',
        message: 'Usuário não encontrado no banco de dados'
      });
    }

    res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Erro interno ao criar evento'
    });
  }
};

export const getEvents = async (req, res) => {
  try {
  
    const [events, total] = await eventService.getUpcomingAndCount(req.query);

    const { page = 1, limit = 10 } = req.query;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      },
      events,
    });

  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao buscar eventos',
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const id = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const [events, total] = await eventService.getLoggedUserEvents(req.query, id);
   
    
    res.status(200).json({
      status: 'success',
      results: events.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: {
        events,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar eventos do usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao buscar seus eventos',
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.getById(id);

    if (!event) {
      return res.status(404).json({ status: 'fail', message: 'Evento não encontrado' });
    }

    if (!event.isPublic) {
      // verifica se é criador OU tem permissão
      const isOwner = req.user?.id === event.createdBy;
      const hasPerm = await EventRoleService.isOrganizer(req.user?.id, id)
                   || await EventRoleService.isModerator(req.user?.id, id);

      if (!isOwner && !hasPerm) {
        return res.status(403).json({ status: 'fail', message: 'Sem permissão' });
      }
    }

    res.status(200).json({ status: 'success', data: { event } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erro interno' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    // 1. Verificar se evento existe e se usuário é o criador
    const existingEvent = await eventService.getById(id);

    if (!existingEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado',
      });
    }


    // 2. Preparar dados para atualização
    const dataToUpdate = {};
    
    if (updates.title !== undefined) dataToUpdate.title = updates.title.trim();
    if (updates.description !== undefined) dataToUpdate.description = updates.description.trim();
    if (updates.location !== undefined) dataToUpdate.location = updates.location.trim();
    if (updates.isPublic !== undefined) dataToUpdate.isPublic = Boolean(updates.isPublic);
    if (updates.maxAttendees !== undefined) dataToUpdate.maxAttendees = updates.maxAttendees ? parseInt(updates.maxAttendees) : null;
    
    // Tratamento especial para datas
    if (updates.date) {
      const newDate = new Date(updates.date);
      if (newDate < new Date()) {
        return res.status(400).json({
          status: 'fail',
          message: 'A data do evento não pode ser no passado',
        });
      }
      dataToUpdate.date = newDate;
    }
    
    if (updates.registrationEndDate) {
      dataToUpdate.registrationEndDate = new Date(updates.registrationEndDate);
    }

    // 3. Atualizar evento
    const event = await eventService.update(dataToUpdate, id)

    res.status(200).json({
      status: 'success',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado',
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao atualizar evento',
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se evento existe e se usuário é o criador
    const existingEvent = await eventService.getById(id);

    if (!existingEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado',
      });
    }

    if (existingEvent.createdBy !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para deletar este evento',
      });
    }

    // Deletar evento (cascade vai deletar subevents automaticamente)
    await eventService.delete(id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado',
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao deletar evento',
    });
  }
};


export const inviteModerator = async (req, res) => {

  try {
    
    const {id} = req.params;
    const userId = req.user.id;
    const {email} = req.params

    const existingEvent = await eventService.getById(id);

    if(!existingEvent){
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado'
      })
    }

    await EventRoleService.inviteModerator(id, email, userId);

    res.status(200).json({
      status: 'sucess',
      message: `Convite de moderador enviado á ${email} para o evento ${existingEvent.title}`
    })


  } catch (error) {
    console.log("Erro ao convidar moderador ", error);
    res.status(500).json({
      status: 'fail',
      message: 'Erro ao convidar moderador '
    })
  }

}