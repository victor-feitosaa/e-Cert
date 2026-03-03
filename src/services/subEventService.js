import  SubEventRepository  from "../repository/SubEventRepository.js"

class SubEventService {
    
    async create (title, description, date, eventId, userId) {
        return await SubEventRepository.create(title, description, date, eventId, userId);
    }

}

export default new SubEventService();