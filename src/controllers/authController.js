import { prisma } from "../config/db.js"
import bcrypt from "bcryptjs";


const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password.trim()
    ) {
        return res.status(400).json({
            error: "Email e senha são obrigatórios",
        });
    }


    //verificar se user ja existe
    const userExists = await prisma.user.findUnique({
        where: {
            email: email.trim(),
        },
    });

    if (userExists) {
        return res.status(400).json({ error: "Ja existe User com este email" })
    }

    // Hash senha
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    //Criar User
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });


    res.status(201).json({
        status: "sucess",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email,
            },
        },
    });
};

export { register };