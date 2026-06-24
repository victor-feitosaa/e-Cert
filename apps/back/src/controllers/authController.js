import { prisma } from "../config/db.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import userService from "../services/userService.js";
import { isValidEmail, isValidCpf, normalizeCpf } from "../utils/validators.js";


const register = async (req, res) => {
  try {
    const { name, email, password, cpf } = req.body;

    // ----- 1. Validação de campos obrigatórios -----
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }
    if (!password || typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ error: "Senha é obrigatória" });
    }
    if (name && typeof name !== "string") {
      return res.status(400).json({ error: "Nome deve ser texto" });
    }

    // ----- 2. Validação de formato de email -----
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // ----- 3. Validação de CPF (se fornecido) -----
    let normalizedCpf = null;
    if (cpf) {
      if (typeof cpf !== "string") {
        return res.status(400).json({ error: "CPF deve ser texto" });
      }
      normalizedCpf = normalizeCpf(cpf);
      if (!isValidCpf(normalizedCpf)) {
        return res.status(400).json({ error: "CPF inválido" });
      }
    }

    // ----- 4. Verificação de unicidade (email e CPF) -----
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim() },
          ...(normalizedCpf ? [{ cpf: normalizedCpf }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.trim()) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }
      if (normalizedCpf && existingUser.cpf === normalizedCpf) {
        return res.status(409).json({ error: "CPF já cadastrado" });
      }
    }

    // ----- 5. Criação do usuário via service -----
    const user = await userService.createAccount(
      name,
      email.trim(),
      password,
      normalizedCpf // salva apenas números
    );

    const token = generateToken(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
        },
        token,
      },
    });

  } catch (error) {
    console.error("Erro no registro:", error);

    // Tratamento específico para erro de unique constraint do Prisma
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      if (field === "email") {
        return res.status(409).json({ error: "Email já cadastrado" });
      }
      if (field === "cpf") {
        return res.status(409).json({ error: "CPF já cadastrado" });
      }
    }

    res.status(500).json({ error: "Erro interno no servidor" });
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