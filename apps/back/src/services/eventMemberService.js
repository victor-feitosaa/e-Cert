// src/services/eventMemberService.js
import EventMemberRepository from "../repository/EventMemberRepository.js";
import UserRepository from "../repository/UserRepository.js";
import emailService from "./emailService.js";
import { prisma } from "../config/db.js";

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

    // ── CONVITE POR E-MAIL ──
    async inviteByEmail(eventId, email, job, granterId) {
        // Verificar se o evento existe
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });
        
        if (!event) {
            throw new Error('Evento não encontrado');
        }

        // Buscar ou criar usuário
        let user = await UserRepository.findByEmail(email);
        let isNewUser = false;

        if (!user) {
            const tempPassword = Math.random().toString(36).slice(-10);
            user = await UserRepository.create(null, email, tempPassword, 'PARCIAL');
            isNewUser = true;

            await emailService.sendEmail(
                email,
                `Convite para equipe do evento: ${event.title}`,
                `<h2>Você foi convidado para a equipe do evento!</h2>
                <p><strong>Evento:</strong> ${event.title}</p>
                <p><strong>Função:</strong> ${job}</p>
                <p><strong>Senha temporária:</strong> ${tempPassword}</p>
                <p>Acesse o sistema para definir sua senha e começar a colaborar.</p>
                <a href="${process.env.FRONTEND_URL}/login">Fazer login</a>`
            );
        }

        // Verificar se já é membro
        const existingMember = await EventMemberRepository.findMemberByUserAndEvent(user.id, eventId);
        
        if (existingMember) {
            throw new Error('Usuário já é membro da equipe deste evento');
        }

        const teamMember = await EventMemberRepository.create(
            user.name || email.split('@')[0],
            'USER',
            job,
            eventId,
            user.id
        );

        return { teamMember, isNewUser, user };
    }
}

export default new EventMemberService();