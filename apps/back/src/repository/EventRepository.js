import { prisma } from "../config/db.js";

class EventRepository {

    async create(data) {

        const { title, description, date, date_start, date_end, banner, category, capacity, location, isPublic, creator } = data;

        return prisma.event.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                date: date,
                date_start: date_start,
                date_end: date_end,
                banner: banner,
                category: category,
                capacity: capacity,
                location: location?.trim() || null,
                isPublic: isPublic === undefined ? true : Boolean(isPublic),
                createdBy: creator
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }

        });


    }

    async getAll() {
        return prisma.event.findMany({
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    async getUpcomingAndCount(whereClause, skip, limit) {
        return Promise.all([
            prisma.event.findMany({
                where: whereClause,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            subEvents: true,
                        },
                    },
                },
                orderBy: {
                    date: 'asc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.event.count({
                where: whereClause,
            }),
        ]);
    }

    async getById(id) {
        return prisma.event.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                subEvents: {
                    orderBy: {
                        date: 'asc',
                    },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        date: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    // Método para buscar eventos onde o usuário é criador
    async getLoggedUserEvents(id, skip, limit) {
        return await Promise.all([
            prisma.event.findMany({
                where: {
                    createdBy: id
                },
                include: {
                    _count: {
                        select: {
                            subEvents: true,
                            participants: true,
                            certificates: true,
                        },
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.event.count({
                where: { createdBy: id },
            }),
        ]);
    }

    // Método para buscar eventos onde o usuário é moderador ou membro da equipe
    async getModeratedOrTeamEvents(id, skip, limit) {
        return await Promise.all([
            prisma.event.findMany({
                where: {
                    AND: [
                        { NOT: { createdBy: id } }, // Exclui eventos onde é dono
                        {
                            OR: [
                                // Buscar em eventTeam (membros da equipe)
                                { 
                                    eventTeam: { 
                                        some: { userId: id } 
                                    } 
                                },
                                // Buscar em eventPermission (moderadores via EventRoleService)
                                {
                                    eventPermissions: {
                                        some: { 
                                            userId: id,
                                            role: { in: ['MODERATOR', 'ORGANIZER'] }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                include: {
                    _count: {
                        select: {
                            subEvents: true,
                            participants: true,
                            certificates: true,
                        },
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    eventTeam: {
                        where: {
                            userId: id
                        },
                        select: {
                            role: true,
                            job: true,
                            name: true,
                        }
                    },
                    eventPermissions: {
                        where: {
                            userId: id
                        },
                        select: {
                            role: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.event.count({
                where: {
                    AND: [
                        { NOT: { createdBy: id } },
                        {
                            OR: [
                                { eventTeam: { some: { userId: id } } },
                                { eventPermissions: { some: { userId: id, role: { in: ['MODERATOR', 'ORGANIZER'] } } } }
                            ]
                        }
                    ],
                },
            }),
        ]);
    }

    // Método para buscar TODOS os eventos do usuário (criados + moderados + equipe)
    async getAllUserEventsWithPagination(id, skip, limit) {
        return await Promise.all([
            prisma.event.findMany({
                where: {
                    OR: [
                        { createdBy: id },
                        { eventTeam: { some: { userId: id } } },
                        { eventPermissions: { some: { userId: id } } }
                    ]
                },
                include: {
                    _count: {
                        select: {
                            subEvents: true,
                            participants: true,
                            certificates: true,
                        },
                    },
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    eventTeam: {
                        where: {
                            userId: id
                        },
                        select: {
                            role: true,
                            job: true,
                            name: true,
                        }
                    },
                    eventPermissions: {
                        where: {
                            userId: id
                        },
                        select: {
                            role: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: parseInt(limit),
            }),
            prisma.event.count({
                where: {
                    OR: [
                        { createdBy: id },
                        { eventTeam: { some: { userId: id } } },
                        { eventPermissions: { some: { userId: id } } }
                    ]
                },
            }),
        ]);
    }

    // Método para contar eventos por role (organizador, moderador, membro)
    async getUserEventStats(id) {
        const allEvents = await prisma.event.findMany({
            where: {
                OR: [
                    { createdBy: id },
                    { eventTeam: { some: { userId: id } } },
                    { eventPermissions: { some: { userId: id } } }
                ]
            },
            include: {
                eventTeam: {
                    where: {
                        userId: id
                    },
                    select: {
                        role: true,
                    }
                },
                eventPermissions: {
                    where: {
                        userId: id
                    },
                    select: {
                        role: true,
                    }
                }
            }
        });
        
        let organizerCount = 0;
        let moderatorCount = 0;
        let memberCount = 0;
        
        allEvents.forEach(event => {
            const isCreator = event.createdBy === id;
            const teamMember = event.eventTeam?.[0];
            const permission = event.eventPermissions?.[0];
            
            if (isCreator) {
                organizerCount++;
            } else if (permission?.role === 'MODERATOR' || teamMember?.role === 'MODERATOR') {
                moderatorCount++;
            } else {
                memberCount++;
            }
        });
        
        return { 
            total: allEvents.length, 
            organizerCount, 
            moderatorCount, 
            memberCount 
        };
    }

    async update(dataToUpdate, id) {

        if (dataToUpdate.capacity) {
            dataToUpdate.capacity = parseInt(dataToUpdate.capacity);
        }

        return prisma.event.update({
            where: { id },
            data: dataToUpdate,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async delete(id) {
        return prisma.event.delete({
            where: { id },
        })
    }

    async getEventParticipants(eventId) {
        const participants = await prisma.eventParticipant.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return participants;
    }

    async createAttendance(eventId, userId) {
        return await prisma.eventAttendance.create({
            data: {
                userId,
                eventId
            }
        });
    }

    async confirmAttendance(eventId, userId) {
        return await prisma.eventAttendance.update({
            where: {
                userId_eventId: {
                    userId,
                    eventId
                }
            },
            data: {
                attended: true
            }
        });
    }

}

export default new EventRepository();