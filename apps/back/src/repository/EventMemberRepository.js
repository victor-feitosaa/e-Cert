// src/repository/EventMemberRepository.js
import { prisma } from "../config/db.js"

class EventMemberRepository {

    async create(name, role = null, job, eventId, userId) {
        return prisma.eventTeam.create({
            data: { name, role, job, eventId, userId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, status: true }
                }
            }
        })
    }

    async update(memberId, dataToUpdate) {
        return prisma.eventTeam.update({
            where: { id: memberId },
            data: dataToUpdate,
            include: {
                user: {
                    select: { id: true, name: true, email: true, status: true }
                }
            }
        });
    }

    async delete(memberId) {
        return prisma.eventTeam.delete({ where: { id: memberId } });
    }

    async getMembersByEvent(id) {
        return prisma.eventTeam.findMany({
            where: { eventId: id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, status: true }
                }
            }
        });
    }

    async getMemberById(id) {
        return prisma.eventTeam.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, status: true }
                }
            }
        });
    }

    async findMemberByUserAndEvent(userId, eventId) {
        return prisma.eventTeam.findFirst({
            where: { userId, eventId }
        });
    }
}

export default new EventMemberRepository();