import { prisma } from '../config/db.js'

class UserRepository {

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async create(name, email, password, status) {
        return prisma.user.create({
            data: {
                name,
                email,
                password,
                status
            }
        });
    }



}

export default new UserRepository()