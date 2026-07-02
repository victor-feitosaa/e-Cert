// src/repository/EventRoleRepository.js
import { prisma } from '../config/db.js'

class EventRoleRepository {

    async findUserByEvent(userId, eventId) {
        return prisma.eventPermission.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            }
        });
    };

    async create(userId, eventId, role, grantedBy = null) {
        return prisma.eventPermission.create({
            data: {
                userId,
                eventId,
                role,
                grantedBy: grantedBy ? grantedBy : userId
            },
            include: {
                user: {
                    select: {id: true, name: true, email: true}
                },
                event: {
                    select: {id: true, title: true}
                }
            }
        });
    }

    async findModeratorsByEvent(eventId) {
        return prisma.eventPermission.findMany({
            where: {
                eventId,
                role: 'MODERATOR'
            },
            include: {
                user: {
                    select: {id: true, name: true, email: true}
                }
            }
        });
    }

    async findUserByEventAndRole(userId, eventId, role) {
        return prisma.eventPermission.findFirst({
            where: {
                userId: userId,
                eventId: eventId,
                role: role
            }
        });
    }

    async deleteByUserAndEvent(eventId, userId, role) {
        return prisma.eventPermission.deleteMany({
            where: {
                eventId,
                userId,
                role
            }
        });
    }

 
    async deleteById(permissionId) {
        return prisma.eventPermission.delete({
            where: { id: permissionId }
        });
    }

    async grantPermission(userId, eventId, role, grantedBy = null) {
        const existingPermission = await this.findUserByEventAndRole(userId, eventId, role);
        if (existingPermission) {
            return existingPermission;
        }
        return prisma.eventPermission.create({
            data: {
                userId,
                eventId,
                role,
                grantedBy: grantedBy ? grantedBy : userId
            }
        });
    }

    //Verifica se o usuário tem qualquer tipo de vínculo com o evento (permissão ou equipe)
    async findAnyEventAssociation(userId, eventId) {
        // Primeiro verifica em event_permissions
        const permission = await prisma.eventPermission.findFirst({
            where: {
                userId: userId,
                eventId: eventId
            }
        });
        if (permission) return permission;

        // Depois verifica em event_teams
        const team = await prisma.eventTeam.findFirst({
            where: {
                userId: userId,
                eventId: eventId
            }
        });
        return team;
    }
}

export default new EventRoleRepository();