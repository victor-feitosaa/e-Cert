import  SubEventRepository  from "../repository/SubEventRepository.js"

class SubEventService {
    
    async create (title, description, date_start, date_end, location, eventId, creator) {

        const date = date_start ? new Date(date_start) : null;

        return await SubEventRepository.create(title, description, date, date_start, date_end, location, eventId, creator);
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