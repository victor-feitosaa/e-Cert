import { prisma } from "../config/db.js"

class SubEventRepository {

    async create (title, description, date, eventId, userId) {
        return prisma.subEvent.create({
            data: {
                title,
                description,
                date,
                eventId: eventId,
                userId
            },
        });
    };

}

export default new SubEventRepository();