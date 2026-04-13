import { prisma } from '../config/db.js'
import EventRoleService from '../services/eventRoleService.js';

export const hasRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const organizerPerm = await EventRoleService.isOrganizer(userId, id);
        const moderatorPerm = await EventRoleService.isModerator(userId, id);

        // fallback: se não tem permissão registrada, verifica se é o criador do evento
        if (!organizerPerm && !moderatorPerm) {
            const event = await prisma.event.findUnique({
                where: { id },
                select: { createdBy: true }
            });

            if (event?.createdBy === userId) {
                // corrige o registro faltante e deixa passar
                await eventRoleService.assignOrganizerRole(userId, id);
                return next();
            }

            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para realizar esta ação.'
            });
        }

        next();
    } catch (error) {
        console.log("Erro de autorização", error);
        res.status(500).json({ status: 'error', message: 'Erro ao verificar permissões' });
    }
}