import { prisma } from "../config/db.js"

class subEventMemberRepository {

    async create (name, role = null, job, subEventId, userId) {

        return prisma.subEventTeam.create({
            data:{
                name,
                role,
                job,
                subEventId,
                userId
            },
            include: {
                user:{
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }})

    }

    async update (memberId, dataToUpdate) {
        return prisma.subEventTeam.update({
            where: { id : memberId },
            data: dataToUpdate,
            include: {
                user: {
                    select:{
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async delete (memberId) {
        return prisma.subEventTeam.delete({
            where: { id: memberId },
        })
    }

    async getMembersBysubEvent(id) {
        return prisma.subEventTeam.findMany({
            where: {subEventId: id },
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
    }

    async getMemberById(id) {
        
        return prisma.subEventTeam.findUnique({
            where: { id },
            select: { userId: true },
        });

    }

    async findMemberByUserAndSubEvent(userId, subEventId) {
        return prisma.subEventTeam.findFirst({
            where: {
                userId,
                subEventId,
            },
        });
    }

    async inviteByEmail(email, subEventId, job, userId) {
        let user = await prisma.user.findUnique({
            where: { email },
        });


       

        return await prisma.subEventTeam.create({
            data: {
                name: user.name,
                role: null,
                job,
                subEventId,
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
    }

}

export default new subEventMemberRepository();