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
            user = await UserRepository.create(null, email, senhaTemp, null, 'PARCIAL');
        }
        const isModerator = await this.isModerator(user.id, eventId);
        if (isModerator) return;
        const response = await EventRoleRepository.create(user.id, eventId, 'MODERATOR', granter)
        await emailService.sendEmail(email, `Convite para moderador`, `Você foi convidado para ser moderador do evento ${response.event.title} !`)
    }

    // eventRoleService.js
    async deleteModerator(permissionId) {
        return await EventRoleRepository.deleteById(permissionId);
    }

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

   
    // src/services/eventRoleService.js

    async canCheckin(userId, eventId) {
        // Verifica se o usuário tem permissão de CHECKIN, ou é ORGANIZER/MODERATOR
        const permission = await EventRoleRepository.findUserByEventAndRole(userId, eventId, 'CHECKIN');
        if (permission) return true;
        
        const isOrg = await this.isOrganizer(userId, eventId);
        if (isOrg) return true;
        
        const isMod = await this.isModerator(userId, eventId);
        if (isMod) return true;
        
        return false;
    }
}

export default new EventRoleService();