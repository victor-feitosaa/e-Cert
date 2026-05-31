// src/services/eventService.js
import EventRepository from '../repository/EventRepository.js'
import { prisma } from '../config/db.js'

class EventService {

    async create(data) {
        return EventRepository.create(data);
    }

    async getAll() {
        return EventRepository.getAll();
    }

    async getUpcomingAndCount(queryParams) {
        const { page = 1, limit = 100, isPublic = true } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const whereClause = {
            isPublic: isPublic === 'true' || isPublic === true,
        };
        
        return EventRepository.getUpcomingAndCount(whereClause, skip, limit);
    }

    async getById(id) {
        return EventRepository.getById(id);
    }

    // Buscar eventos onde o usuário é criador
    async getLoggedUserEvents(queryParams, id) {
        const { page = 1, limit = 100 } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        return await EventRepository.getLoggedUserEvents(id, skip, parseInt(limit));
    }

    // Buscar eventos onde o usuário é moderador ou membro da equipe (excluindo os que criou)
    async getModeratedOrTeamEvents(queryParams, id) {
        const { page = 1, limit = 100 } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        return await EventRepository.getModeratedOrTeamEvents(id, skip, parseInt(limit));
    }

    // Buscar TODOS os eventos do usuário (criados + moderados + equipe) com paginação
    async getAllUserEventsWithPagination(queryParams, id) {
        const { page = 1, limit = 100 } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        return await EventRepository.getAllUserEventsWithPagination(id, skip, parseInt(limit));
    }

    // Buscar estatísticas do usuário por role
    async getUserEventStats(id) {
        return await EventRepository.getUserEventStats(id);
    }

    async update(data, id) {
        return EventRepository.update(data, id);
    }

    async delete(id) {
        return EventRepository.delete(id);
    }

    async getEventParticipants(eventId) {
        return EventRepository.getEventParticipants(eventId);
    }

    async confirmAttendance(eventId, userId) {
        // Verificar se já existe registro de presença
        const existingAttendance = await prisma.eventAttendance.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });

        if (!existingAttendance) {
            // Criar registro de presença se não existir
            await EventRepository.createAttendance(eventId, userId);
        }
        
        // Confirmar presença
        return EventRepository.confirmAttendance(eventId, userId);
    }

    async isEventParticipant(eventId, userId) {
        const participant = await prisma.eventParticipant.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        return !!participant;
    }

    async getEventAttendanceStatus(eventId, userId) {
        const attendance = await prisma.eventAttendance.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
        return attendance || null;
    }
}

export default new EventService();