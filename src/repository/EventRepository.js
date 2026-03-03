import { prisma } from "../config/db.js";

class EventRepository {

    async create (title, description, date, location, isPublic, creator) {

        return prisma.event.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                date: date,
                location: location?.trim() || null,
                isPublic: isPublic === undefined ? true : Boolean(isPublic),
                createdBy: creator 
            },
            include: {
                creator: {
                    select:{
                        id:true,
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

    async getById(id){
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

    async getLoggedUserEvents (id, skip, limit) {

        return Promise.all([prisma.event.findMany({
            where: { createdBy: id },
            include: {
                _count: {
                    select: {
                        subEvents: true,
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

    async update (dataToUpdate, id) {
        return prisma.event.update({
            where: {id},
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
            where:{id} ,
        })
    }
}

export default new EventRepository();