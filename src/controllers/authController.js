import { prisma } from "../config/db.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";


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

    //gerar token JWT
    const token = generateToken(user.id, res)

    res.status(201).json({
        status: "sucess",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email,
            },
            token,
        },
    });
};


const login = async (req, res) => {
    const {email, password } = req.body;
    
    //checar se ja existe user com o email
    const user = await prisma.user.findUnique({
        where: {email: email},
    });

    if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos "})
    }

    //verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: "Email ou senha inválidos"});
    }


    //gerar token JWT
    const token = generateToken(user.id, res);


        res.status(201).json({
        status: "sucess",
        data: {
            user: {
                id: user.id,
                email: email,
            },
            token,
        },
    });
}

const logout = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        status: "sucess",
        message: "Logout efetuado",
    });
};

export { register, login, logout};