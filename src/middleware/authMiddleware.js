// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Pegar token do cookie ou header
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Você não está logado. Faça login para acessar.'
      });
    }

    // 2. Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded); // DEBUG
    
    // 3. PEGAR O ID CORRETAMENTE - ISSO É CRÍTICO!
    // Olha como seu token foi gerado: { userId: ... } ou { id: ... }?
    const userId = decoded.userId || decoded.id; // ← ACEITA AMBOS
    
    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token inválido - sem identificação de usuário'
      });
    }

    // 4. Buscar usuário no banco - AGORA COM ID VÁLIDO!
    const user = await prisma.user.findUnique({
      where: { 
        id: userId  // ← AGORA NÃO É MAIS UNDEFINED!
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Usuário não encontrado no sistema'
      });
    }

    // 5. Salvar usuário na requisição
    req.user = user;
    next();

  } catch (error) {
    console.error('❌ Erro no authMiddleware:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token inválido. Faça login novamente.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token expirado. Faça login novamente.'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Erro na autenticação'
    });
  }
};