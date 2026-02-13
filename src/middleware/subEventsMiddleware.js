import { prisma } from "../config/db.js";

export const canManageSubEvent = async (req, res, next) => {

    try { 
        const subEventId = req.params.id;

        const subEvent = await prisma.subEvent.findUnique({
            where: { id: subEventId },
            select: { event: { select: { createdBy: true } } }
        });

        if (!subEvent) {
            return res.status(404).json({
                status: 'fail',
                message: 'Subevento não encontrado',
            });
        }

        if (subEvent.event.createdBy !== req.user.id) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para gerenciar este subevento',
            });
        }


        next();

    } catch (error) {
        console.error('Erro ao verificar permissão para subevento:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar permissões para subevento',
        });
    }

}