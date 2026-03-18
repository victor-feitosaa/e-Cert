import subEventMemberRepository from "../repository/subEventMemberRepository.js";

class subEventMemberService {

    async create(name, role = null, job, subEventId, userId) {
        return await subEventMemberRepository.create(name, role, job, subEventId, userId);
    }

    async update(memberId, dataToUpdate) {
        return await subEventMemberRepository.update(memberId, dataToUpdate);
    }

    async delete(memberId) {
        return await subEventMemberRepository.delete(memberId);
    }

    async getMembersBysubEvent(id) {
        return await subEventMemberRepository.getMembersBysubEvent(id);
    }

    async getMemberById(id) {
        return await subEventMemberRepository.getMemberById(id);
    }



}

export default new subEventMemberService();