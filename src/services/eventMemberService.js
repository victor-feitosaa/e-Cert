import EventMemberRepository from "../repository/EventMemberRepository.js";

class EventMemberService {

    async create(name, role = null, job, eventId, userId) {
        return await EventMemberRepository.create(name, role, job, eventId, userId);
    }

    async update(memberId, dataToUpdate) {
        return await EventMemberRepository.update(memberId, dataToUpdate);
    }

    async delete(memberId) {
        return await EventMemberRepository.delete(memberId);
    }

    async getMembersByEvent(id) {
        return await EventMemberRepository.getMembersByEvent(id);
    }

    async getMemberById(id) {
        return await EventMemberRepository.getMemberById(id);
    }



}

export default new EventMemberService();