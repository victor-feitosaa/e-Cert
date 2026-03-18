import  SubEventRepository  from "../repository/SubEventRepository.js"

class SubEventService {
    
    async create (title, description, date, eventId, creator) {
        return await SubEventRepository.create(title, description, date, eventId, creator);
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

    async findById (id) {
        return await SubEventRepository.findById(id);
    }

}

export default new SubEventService();