// src/controllers/eventsTeamController.js
import { prisma } from "../config/db.js"
import eventMemberService from "../services/eventMemberService.js";
import eventRoleService from "../services/eventRoleService.js";
import eventService from "../services/eventService.js";
import participantService from "../services/participantService.js";

// ── CRIAR MEMBRO MANUAL (legado) ──
export const createTeamMember = async (req, res) => {
    try {
        const { name, role, job } = req.body;
        const userId = req.user.id;
        const { id: eventId } = req.params;
    
        const event = await eventService.getById(eventId);
    
        if (!event) {
            return res.status(404).json({
                status: "fail",
                message: "Evento não encontrado"
            });
        }

        if (!name?.trim()) {
            return res.status(400).json({
                status: "fail",
                message: "É obrigatório informar um nome"
            });
        }
    
        if (!job?.trim()) {
            return res.status(400).json({
                status: "fail",
                message: "É obrigatório informar uma função"
            });
        }
    
        const team = await eventMemberService.create(name, role, job, event.id, userId);
    
        res.status(201).json({
            status: "success",
            message: "Membro adicionado à equipe",
            data: { team }
        });

    } catch (error) {
        console.log("Erro ao criar membro ", error);
        res.status(500).json({
            status: "error",
            message: "Erro ao criar membro"
        });
    }
}

// ── CONVIDAR MEMBRO POR E-MAIL ──
export const inviteTeamMemberByEmail = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const { email, job } = req.body;
        const userId = req.user.id;

        // Validar evento
        const event = await eventService.getById(eventId);
        if (!event) {
            return res.status(404).json({
                status: 'fail',
                message: 'Evento não encontrado'
            });
        }

        // Verificar permissão ou moderador
        const isOrganizerOrModerator = await eventRoleService.isOrganizerOrModerator(userId, eventId);
        if (!isOrganizerOrModerator) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para convidar membros para este evento'
            });
         }    
        

        // Validações
        if (!email?.trim()) {
            return res.status(400).json({
                status: 'fail',
                message: 'E-mail é obrigatório'
            });
        }

        if (!email.includes('@')) {
            return res.status(400).json({
                status: 'fail',
                message: 'E-mail inválido'
            });
        }

        if (!job?.trim()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Função é obrigatória'
            });
        }

        //participantes não podem ser membros

        const isAttendee = await participantService.findByEmailAndEventId(email, eventId);
        if (isAttendee) {
            return res.status(400).json({
                status: 'fail',
                message: 'Participantes não podem ser membros da equipe'
             });
         }

        const result = await eventMemberService.inviteByEmail(eventId, email, job, userId);

        res.status(201).json({
            status: 'success',
            message: result.isNewUser 
                ? `Convite enviado para ${email}. Uma conta foi criada com senha temporária.`
                : `Usuário ${email} foi adicionado à equipe do evento.`,
            data: { teamMember: result.teamMember }
        });

    } catch (error) {
        console.error('Erro ao convidar membro da equipe:', error);
        
        if (error.message === 'Evento não encontrado') {
            return res.status(404).json({
                status: 'fail',
                message: error.message
            });
        }
        
        if (error.message === 'Usuário já é membro da equipe deste evento') {
            return res.status(409).json({
                status: 'fail',
                message: error.message
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Erro ao convidar membro da equipe'
        });
    }
}

// Dar permissão para um membro
export const grantCheckInPermission = async (req, res) => {
    try {
        const { memberId } = req.params;
        const userId = req.user.id;
        const member = await eventMemberService.getMemberById(memberId);

        if (!member) {
            return res.status(404).json({
                status: 'fail',
                message: 'Membro não encontrado'
            });
        }

        const updatedMember = await eventMemberService.grantPermission(memberId, 'CHECKIN');

        res.status(200).json({
            status: 'success',
            data: { updatedMember }
        });

    } catch (error) {
        console.error('Erro ao conceder permissão de check-in:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno ao conceder permissão de check-in'
        });
    }
}

// ── LISTAR MEMBROS ──
export const getMyTeam = async (req, res) => {
    try {
        const { id: eventId } = req.params;

        const team = await eventMemberService.getMembersByEvent(eventId);

        res.status(200).json({
            status: 'success',
            data: { team }
        });
        
    } catch (error) {
        console.log('Erro ao buscar time: ', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao buscar time'
        });
    }
}

// ── ATUALIZAR MEMBRO ──
export const updateMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const updates = req.body;
        const userId = req.user.id;

        const existingMember = await eventMemberService.getMemberById(memberId);

        if (!existingMember) {
            return res.status(404).json({
                status: 'fail',
                message: 'Membro não encontrado'
            });
        }

        // Verificar permissão
        const event = await eventService.getById(existingMember.eventId);
        
        if (event.createdBy !== userId && existingMember.userId !== userId) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para atualizar este membro'
            });
        }

        const dataToUpdate = {};

        if (updates.name !== undefined) dataToUpdate.name = updates.name.trim();
        if (updates.job !== undefined) dataToUpdate.job = updates.job.trim();
        if (updates.role !== undefined) dataToUpdate.role = updates.role;

        const eventMember = await eventMemberService.update(memberId, dataToUpdate);

        res.status(200).json({
            status: 'success',
            data: { eventMember }
        });
        
    } catch (error) {
        console.log("Erro ao atualizar membro: ", error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                status: 'fail', 
                message: 'Membro não encontrado'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Erro interno ao atualizar membro'
        });
    }
}

// ── REMOVER MEMBRO ──
export const deleteMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const userId = req.user.id;

        const existingMember = await eventMemberService.getMemberById(memberId);

        if (!existingMember) {
            return res.status(404).json({
                status: 'fail',
                message: 'Membro não encontrado'
            });
        }

        // Verificar permissão (apenas criador do evento)
        const event = await eventService.getById(existingMember.eventId);
        
        if (event.createdBy !== userId) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para remover este membro'
            });
        }

        await eventMemberService.delete(memberId);

        res.status(204).send();

    } catch (error) {
        console.error('Erro ao remover membro: ', error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                status: 'fail', 
                message: 'Membro não encontrado'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Erro interno ao remover membro'
        });
    }
}