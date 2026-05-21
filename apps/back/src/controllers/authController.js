import { prisma } from "../config/db.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import userService from "../services/userService.js";


const register = async (req, res) => {

    try {
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

        const user = await userService.createAccount(name, email, password);

        const token = generateToken(user.id, res)

        res.status(201).json({
            status: 'sucess',
            data: {
                user: {
                    id: user.id,
                    name,
                    email,
                },
                token,
            },
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "erro interno"
        })
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos " })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
    }

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

// Retorna o usuário autenticado — usado pelo Astro SSR para hidratar props
const me = async (req, res) => {
    res.status(200).json({
        status: "success",
        data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
            },
        },
    });
};



export { register, login, logout, me };