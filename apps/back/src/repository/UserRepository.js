import { prisma } from "../config/db.js"

class UserRepository {

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async findById(id) {
        return prisma.user.findUnique({
            where: {
                id,
            }
        })
    }

    async create(name, email, password, cpf, status) {
        return prisma.user.create({
            data: {
                name,
                email,
                password,
                cpf,
                status
            }
        });
    }

    async update(name, email, password, cpf, status) {
        return prisma.user.update({
            where: {email},
            data: {
                name,
                email,
                password,
                cpf,
                status
            }
        });
    }

    


}

export default new UserRepository()