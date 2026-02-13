import { prisma } from '../config/db.js';

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

// @desc    Criar novo evento
// @route   POST /api/events
// @access  Private
// controllers/eventsController.js
export const createEvent = async (req, res) => {
  try {
    // DEBUG - Ver o que chegou
    console.log('👤 req.user:', req.user);
    console.log('📦 req.body:', req.body);

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
    console.log(' Criando evento para usuário:', req.user.id);
    
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        date: eventDate,
        location: location?.trim() || null,
        isPublic: isPublic === undefined ? true : Boolean(isPublic),
        createdBy: req.user.id  
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Evento criado:', event.id);

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

// @desc    Buscar todos os eventos (públicos)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, upcoming = 'true' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {
      isPublic: true,
      ...(upcoming === 'true' && {
        date: {
          gte: new Date(),
        },
      }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              subEvents: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.event.count({
        where: whereClause,
      }),
    ]);

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
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao buscar eventos',
    });
  }
};

// @desc    Buscar evento específico
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subEvents: {
          orderBy: {
            date: 'asc',
          },
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            createdAt: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado',
      });
    }

    // Se não for público e usuário não for o criador
    if (!event.isPublic && (!req.user || req.user.id !== event.createdBy)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para acessar este evento',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno ao buscar evento',
    });
  }
};

// @desc    Atualizar evento
// @route   PUT /api/events/:id
// @access  Private (apenas criador)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    // 1. Verificar se evento existe e se usuário é o criador
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { createdBy: true },
    });

    if (!existingEvent) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado',
      });
    }

    if (existingEvent.createdBy !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para atualizar este evento',
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
    const event = await prisma.event.update({
      where: { id },
      data: dataToUpdate,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

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

// @desc    Deletar evento
// @route   DELETE /api/events/:id
// @access  Private (apenas criador)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se evento existe e se usuário é o criador
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { createdBy: true },
    });

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
    await prisma.event.delete({
      where: { id },
    });

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

// @desc    Buscar eventos do usuário logado
// @route   GET /api/events/my
// @access  Private
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { createdBy: userId },
        include: {
          _count: {
            select: {
              subEvents: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.event.count({
        where: { createdBy: userId },
      }),
    ]);

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