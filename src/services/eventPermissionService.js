import EventPermissionRepository from "../repository/EventPermissionRepository.js";
import UserRepository from "../repository/UserRepository.js";
import emailService from "./emailService.js";


class EventPermissionService {

    async assignOrganizerRole(userId, eventId) {
        const existing = await EventPermissionRepository.findUserByEvent(userId, eventId);

        if (existing) {
            return existing;
        }

        return await EventPermissionRepository.create(userId, eventId, 'ORGANIZER');
    };

    async isOrganizer(userId, eventId) {
        return await this.hasRole(userId, eventId, 'ORGANIZER');
    };

    async isModerator(userId, eventId) {
        return await this.hasRole(userId, eventId, 'MODERATOR');
    }

    async hasRole(userId, eventId, role) {
        return !!await EventPermissionRepository.findUserByEventAndRole(userId, eventId, role);
    }

    async inviteModerator(eventId, email, granter) {

        let user = await UserRepository.findByEmail(email);

        if (!user) {
            const senhaTemp = Math.random().toString(36).slice(-10);

            user = await UserRepository.create(null, email, senhaTemp, 'PARCIAL');
        }

        const isModerator = await this.isModerator(user.id, eventId);
        if (isModerator) {
            return;

        }

        const response = await EventPermissionRepository.create(user.id, eventId, 'MODERATOR', granter)

        await emailService.sendEmail(email, `Convite para moderador', 'Você foi convidado para ser moderador do evento ${response.event.title} !`)
    }
}

export default new EventPermissionService();