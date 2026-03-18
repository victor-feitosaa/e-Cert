import { prisma } from '../config/db.js'
import eventRoleService from '../services/EventRoleService.js';

export const hasRole = async (req, res, next) => {

    try {
        const { id } = req.params;
        const userId = req.user.id;

        const organizerPerm = await eventRoleService.isOrganizer(userId, id);
        
        const moderatorPerm = await eventRoleService.isModerator(userId, id);

        if (!organizerPerm && !moderatorPerm) {
            return res.status(404).json({
                status: 'fail',
                message: 'Você não tem permissão para realizar esta ação.'
            })
        }

        next();

    } catch (error) {
        console.log("Erro de autorização", error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar permissões',
        })
    }

}