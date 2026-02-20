import { prisma } from '../config/db.js';

export const isEventOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id},
      select: { createdBy: true },
    });

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evento não encontrado',
      });
    }

    if (event.createdBy !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Você não tem permissão para realizar esta ação',
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar permissões',
    });
  }
};