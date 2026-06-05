// src/services/eventRoleService.js
import EventRoleRepository from "../repository/EventRoleRepository.js";
import UserRepository from "../repository/UserRepository.js";
import emailService from "./emailService.js";

class EventRoleService {

    async assignOrganizerRole(userId, eventId) {
        const existing = await EventRoleRepository.findUserByEvent(userId, eventId);
        if (existing) return existing;
        return await EventRoleRepository.create(userId, eventId, 'ORGANIZER');
    };

    async isOrganizer(userId, eventId) {
        return await this.hasRole(userId, eventId, 'ORGANIZER');
    };

    async isModerator(userId, eventId) {
        return await this.hasRole(userId, eventId, 'MODERATOR');
    }

    async hasRole(userId, eventId, role) {
        return !!await EventRoleRepository.findUserByEventAndRole(userId, eventId, role);
    }

    async getModerators(eventId) {
        return await EventRoleRepository.findModeratorsByEvent(eventId);
    }

    async inviteModerator(eventId, email, granter) {
        let user = await UserRepository.findByEmail(email);
        if (!user) {
            const senhaTemp = Math.random().toString(36).slice(-10);
            user = await UserRepository.create(null, email, senhaTemp, 'PARCIAL');
        }
        const isModerator = await this.isModerator(user.id, eventId);
        if (isModerator) return;
        const response = await EventRoleRepository.create(user.id, eventId, 'MODERATOR', granter)
        await emailService.sendEmail(email, `Convite para moderador`, `Você foi convidado para ser moderador do evento ${response.event.title} !`)
    }

    async deleteModerator(eventId, userId) {
        return await EventRoleRepository.deleteByUserAndEvent(userId, eventId, 'MODERATOR');
    };

    // Verifica se o usuário é moderador OU qualquer tipo de membro da equipe
    async isModeratorOrMember(userId, eventId) {
        // Verifica se existe qualquer associação (permissão ou equipe)
        const association = await EventRoleRepository.findAnyEventAssociation(userId, eventId);
        if (!association) return false;
        
        // Se a associação veio de event_permissions, verifica se a role não é 'ATTENDEE'
        if (association.role) {
            // Permite apenas se for ATTENDEE (participante comum)
            // Caso contrário, considera como moderador/membro (impede inscrição)
            return association.role !== 'ATTENDEE';
        }
        
        // Se veio de event_team (não tem role no mesmo sentido), considera como membro
        return true;
    }

    async isOrganizerOrModerator(userId, eventId) {
        const role = await EventRoleRepository.findUserByEvent(userId, eventId);
        return role && (role.role === 'ORGANIZER' || role.role === 'MODERATOR');
    }
}

export default new EventRoleService();