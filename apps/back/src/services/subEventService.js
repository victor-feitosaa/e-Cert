import  SubEventRepository  from "../repository/SubEventRepository.js"

class SubEventService {
    
    async create (title, description, location, capacity, eventId, creator) {

        const subEvent = await SubEventRepository.create(title, description, location, capacity, eventId, creator);

        if (!subEvent) {
            throw new Error('Erro ao criar subevento no repositório');
        }
        
        return subEvent;
    }

    async update (dataToUpdate, id) {
        return await SubEventRepository.update(dataToUpdate, id);
    }

    async delete(id) {
        return await SubEventRepository.delete(id);
    }

    async getAllSubEventsOfEvent(id) {

        return await SubEventRepository.getAllSubEventsOfEvent(id);
    }

    async getEventBySubEventId(subEventId) {
        return await SubEventRepository.getEventBySubEventId(subEventId);
    }

    async findById (id) {
        return await SubEventRepository.findById(id);
    }

   

}

export default new SubEventService();