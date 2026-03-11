import UserRepository from "../repository/UserRepository.js";
import bcrypt from "bcryptjs";

class UserService {

    async createAccount(name, email, password) {
        console.log(name, email, password);

        const userExists = await UserRepository.findByEmail(email);

        // Hash senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Se o usuário não existe, cria um novo
        if (!userExists) {
            console.log("USER NÃO ENCONTRADO - Criando novo usuário");
            const createdUser = await UserRepository.create(name, email, hashedPassword, 'ACTIVE');
            return createdUser;
        }

        // Se o usuário existe mas está com status PARCIAL, atualiza
        if (userExists.status === 'PARCIAL') {
            const updatedUser = await UserRepository.update(name, email, hashedPassword, 'ACTIVE');
            return updatedUser;
        }

        // Se o usuário já existe com outro status, retorna erro
        throw new Error("Já existe um usuário com este email");
    }

}

export default new UserService();