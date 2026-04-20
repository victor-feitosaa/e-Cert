import EventRepository from "../repository/EventRepository.js";

class EventService {

    async create (data) {
        return await EventRepository.create(data)

    }

    async getUpcomingAndCount(queryParams) {

        const { page = 1, limit = 10, upcoming = 'true' } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {
            isPublic: true,
            ...(upcoming === 'true' && {
                date: {
                    gte: new Date(),
                },
            }),
        };

        return await EventRepository.getUpcomingAndCount(whereClause, skip, parseInt(limit));
    }


    async getLoggedUserEvents(queryParams, id) {
        const { page = 1, limit = 10 } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        
        return await EventRepository.getLoggedUserEvents(id, skip, parseInt(limit));
    }

    async getById(id) {
        return await EventRepository.getById(id);
    }

    async update(dataToUpdate, id) {
        return await EventRepository.update(dataToUpdate, id);
    }

    async delete(id) {
        return await EventRepository.delete(id);
    }


}

export default new EventService();