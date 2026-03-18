import { prisma } from "../config/db.js"

class SubEventRepository {

    async create (title, description, date, eventId, creator) {
        return prisma.subEvent.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                date: date,
                eventId,
                createdBy: creator,
            },
            include:{
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    };

    async update (dataToUpdate, id) {
        return prisma.subEvent.update({
            where: { id },
            data: dataToUpdate,
        });
    }

    async delete (id) {
        return prisma.subEvent.delete({
            where: { id },
        })
    }

    async getAllSubEventsOfEvent(id) {
        
        return Promise.all([
            prisma.subEvent.findMany({
                where: {eventId: id},

            }),
            prisma.subEvent.count({
                where: {eventId: id},
            }),
        ]);
    }

    async findById(id){
        return prisma.subEvent.findUnique({
            where: { id },
            select: { createdBy: true },
        })
    }
}

export default new SubEventRepository();