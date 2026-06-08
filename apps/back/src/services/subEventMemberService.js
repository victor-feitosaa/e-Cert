import subEventMemberRepository from "../repository/subEventMemberRepository.js";
import UserRepository from "../repository/UserRepository.js";
import emailService from "./emailService.js";
import subEventService from "./subEventService.js";

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

    async inviteByEmail(email, subEventId, job, userId) {

        const subEvent = await subEventService.findById(subEventId);

        if (!subEvent) {
            throw new Error('Subevento não encontrado');
        }

        let user = await UserRepository.findByEmail(email);
        let isNewUser = false;

        if (!user) {
            const tempPassword = Math.random().toString(36).slice(-10);
            user = await UserRepository.create(email.split('@')[0], email, tempPassword,null, 'PARCIAL');
            isNewUser = true;

            await emailService.sendEmail(
                email,
                `Convite para equipe do subevento: ${subEvent.title}`,
                `<h2>Você foi convidado para a equipe do subevento!</h2>
                <p><strong>Subevento:</strong> ${subEvent.title}</p>
                <p><strong>Função:</strong> ${job}</p>
                <p><strong>Senha temporária:</strong> ${tempPassword}</p>
                <p>Acesse o sistema para definir sua senha e começar a colaborar.</p>
                <a href="${process.env.FRONTEND_URL}/login">Fazer login</a>`
            );
        }

        const existingMember = await subEventMemberRepository.findMemberByUserAndSubEvent(user.id, subEventId);

        if (existingMember) {
            throw new Error('Usuário já é membro deste subevento');
         }

        const memberName = user.name || user.email.split('@')[0];
        const teamMember = await subEventMemberRepository.create(memberName, 'USER', job, subEventId, user.id);
        return teamMember;

    }
}
export default new subEventMemberService();