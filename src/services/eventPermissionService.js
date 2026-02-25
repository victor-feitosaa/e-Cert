import { EventPermissionType, EventRole } from "../config/db.js"

class EventPermissionService {


    //atributos
    organizerPermissions = [
        EventPermissionType.MANAGE_EVENT,
        EventPermissionType.MANAGE_SUBEVENTS,
        EventPermissionType.MANAGE_ATTENDEES,
        EventPermissionType.MANAGE_PERMISSIONS,
        EventPermissionType.VIEW_ANALYTICS
    ];

    moderatorPermissions = [
        EventPermissionType.MANAGE_SUBEVENTS,
        EventPermissionType.VIEW_ANALYTICS
    ];




    async assignOrganizerRole(userId, eventId) {

        try {
            const existing = await prisma.eventPermission.findUnique({
                where: {
                    userId_eventId: {
                        userId,
                        eventId
                    
                    }
                }
            });

            if (existing) {
                console.log(`User ${userId} já tem permissão no evento ${eventId}`)
                return existing;
            }
            
            //criar permissão de organizer
            const permission = await prisma.eventPermission.create({
                data: {
                    userId,
                    eventId,
                    role: 'ORGANIZER',
                    permissions: this.organizerPermissions,
                    grantedBy: userId,
                    grantedAt: new Date()
                },
                include: {
                    user: {
                        select: {id: true, name: true, email: true }
                    },
                    event: {
                        select: {id: true, title: true }
                    }
                }
            });

            console.log(`Organizer role atribuída: User ${userId} no Evento ${eventId}`);
            return permission;

        } catch (error) {
            console.log('Erro ao atribuir organizer role: ', error)
            throw error;
        }
    };

    async isOrganizer (userId, eventId) {

        try {
            const permission = await prisma.eventPermission.findUnique({
                where: {
                    userId_eventId:{
                        userId,
                        eventId     
                    }
                }
            });

            return permission?.role === 'ORGANIZER'
            
        } catch (error) {
            console.error("Erro ao verificar se é organizer: ", error);
            return false;
            } 
            
    };

    async hasPermission (userId, eventId, requiredPermissions){



    }



}