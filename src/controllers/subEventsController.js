import { prisma } from '../config/db.js'

export const createSubEvent = async (req,res) => {

    try {
        
        const { title, description, date, eventId, userId} = req.body;
    
        const event = await prisma.event.findUnique({
            where: {id: eventId} 
        })
    
        if (!event) {
            return res.status(404).json({
                status: 'fail',
                message: 'Evento não encontrado'
            })
        }
    
            if (!userId) {
            return res.status(404).json({
                status: 'fail',
                message: 'Evento não encontrado'
            })
        }
    
        if (!title?.trim()) {
            return res.status(404).json({
                status: 'fail',
                message: 'Titulo é obrigatorio'
    
            })
        }
    
        if (!description?.trim()) {
            return res.status(404).json({
                status: 'fail',
                message: 'A descrição é obrigatoria'
            })
        }
    
        if (!date) {
            return res.status(404).json({
                status: 'fail',
                message: 'A data é obrigatoria'
            })
        }
    
        const subEvent = await prisma.subEvent.create({
            data:
                {
                    title,
                    description,
                    date,
                    eventId: event.id,
                    userId
                },
    
            
        });
    
        res.status(201).json({
            status: 'sucess',
            data: {subEvent}
        });



    } catch (error) {
        console.error('Erro ao criar sub evento:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro ao criar sub evento'
        });
    }

}

export const getSubEvents = async (req, res) => {

    try {

        const {id} = req.params;


        const [subEvents, total ] = await Promise.all([
            prisma.subEvent.findMany({
                where: {eventId: id},
            }),
            prisma.subEvent.count({
                where: {eventId: id},
            }),
        ]);

        res.status(200).json({
            status: 'sucess',
            results: subEvents.length,
            data:{
                subEvents,
            },
        });
    } catch (error) {
        console.error('Error ao buscar subEventos ', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar sub eventos'
        })
    }

}

export const updateSubEvent = async (req, res) => {

    try {
        
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user.id;

        const existingSubEvent = await prisma.subEvent.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!existingSubEvent) {
            return res.status(404).json({
                status: 'fail',
                message: 'Sub Evento não encontrado',
            });
        }

        if (existingSubEvent.userId !== userId) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para atualizar este sub-evento'
            });
        }

        const dataToUpdate = {};

        if(updates.title !== undefined ) dataToUpdate.title = updates.title.trim();
        if (updates.description !== undefined) dataToUpdate.description = updates.description.trim();
        if (updates.date) {
            const newDate = new Date(updates.date);
            if (newDate < new Date()) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'A data do evento não pode no passado'
                });
            }
            dataToUpdate.date = newDate;
        }

        const subEvent = await prisma.subEvent.update({
            where: { id },
            data: dataToUpdate,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(200).json({
            status: 'sucess',
            data: {
                subEvent,
            },
        });


    } catch (error) {
        
    }

}

export const deleteSubEvent = async (req, res) => {

    try {
        
        const {id} = req.params;
        const userId = req.user.id;

        const existingSubEvent = await prisma.subEvent.findUnique({
            where: { id },
            select: { userId: true},
        });

        if (!existingSubEvent) {
            return res.status(404).json({
                status: 'fail',
                message: 'Sub-Evento não encontrado',
            });
        }

        if (existingSubEvent.userId !== userId) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para deletar este sub-evento'
            });
        }

        await prisma.subEvent.delete({
            where: { id },
        });

        res.status(204).json({
            status: 'sucess',
            data: null,
        })


    } catch (error) {
        console.error('Erro ao deletar sub-evento: ', error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                status: 'fail', 
                message: 'Sub-evento não encontrado',
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Erro interno ao deletar evento',
        });
    }
};

