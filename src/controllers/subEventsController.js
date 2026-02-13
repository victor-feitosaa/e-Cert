import { prisma } from "../config/db.js";

export const createSubEvent = async (req, res) => {
    try {
        const { name, description, eventId } = req.body;

        // Verificar se o evento existe
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return res.status(404).json({
                status: 'fail',
                message: 'Evento não encontrado',
            });
        }
        // Criar subevento
        const subEvent = await prisma.subEvent.create({
            data: {
                name,
                description,
                eventId,
                userId: req.user.id, // Associa o subevento ao usuário logado
            },
        });
        res.status(201).json({
            status: 'successo ao criar subevento ' + subEvent.name,
            data: subEvent,
        });
    } catch (error) {
        console.error('Erro ao criar subevento:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao criar subevento',
        });
    }   
};

export const getSubEventsByEvent = async (req, res) => {
    try {
        const eventId = req.params.id ;
        const subEvents = await prisma.subEvent.findMany({
            where: { eventId },
        });
        res.status(200).json({
            status: 'success',
            data: subEvents,
        });
    } catch (error) {
        console.error('Erro ao buscar subeventos:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao buscar subeventos',
        });
        
    }
};