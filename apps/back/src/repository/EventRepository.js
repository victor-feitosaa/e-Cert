import { prisma } from "../config/db.js";

class EventRepository {

    async create (data) {

        const {title, description, date, date_start, date_end, banner, category, capacity, location, isPublic, creator} = data;

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

    async getLoggedUserEvents(id, skip, limit) {
        return await Promise.all([
            prisma.event.findMany({
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

        dataToUpdate.capacity = parseInt(dataToUpdate.capacity);

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