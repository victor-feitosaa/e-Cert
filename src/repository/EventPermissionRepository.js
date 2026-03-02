import { prisma } from '../config/db.js'

class EventPermissionRepository {

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


    async findUserByEventAndRole(userId, eventId, role) {

        return  prisma.eventPermission.findFirst({
            where: {
                userId: userId,
                eventId: eventId,
                role: role
            }
        });
    }

}

export default new EventPermissionRepository();