import { prisma } from "../config/db.js";

export const createSubMember = async (req, res) => {

    try {
        const {subEventId} = req.params;
        const userId = req.user.id;
        const {name, role, job} = req.body;

        const subEvent = await prisma.subEvent.findUnique({
            where: { id: subEventId }
        });

        if (!subEvent) {
            return res.stauts(404).json({
                status: "fail",
                message: "Sub-Evento não encontrado"
            });
        };

        if (!userId) {
            return res.status(404).json({
                status: 'fail',
                message: 'User não validado'
            })
        };

        if (!name?.trim()) {
            return res.status(404).json({
                status:'fail',
                message: 'É obrigatório informar um nome'
            })
        }

        if (!job?.trim()) {
            return res.status(404).json({
                status: 'fail',
                message:'É obrigatório informar uma função'
            })
        };

        const team = await prisma.subEventTeam.create({
            data: {
                name,
                role,
                job,
                subEventId: subEvent.id,
                userId
            },
        });

        res.status(201).json({
            status: 'sucess',
            message: "Membro criado: ",
            data: {team}
        });

    } catch (error) {
        console.log("Erro ao criar membro ", error);
        res.status(500).json({
            status: 'fail',
            message: "Erro interno ao criar membro"
        });
    }
}

export const getMyTeam = async (req, res) => {
    try {
        const {subEventId} = req.params;

        const team = await prisma.subEventTeam.findMany({
            where: { subEventId },
            include: {
                user: {
                    select: {
                        id: true,
                        name:true,
                        email:true,
                    },
                },
            },
        });

        if (!team) {
            return res.status(404).json({
                status: "fail",
                message: "Time não encontrado",
            });
        }
       

        res.status(200).json({
            status: 'sucess',
            data: {
                team,
            },
        });
        
    } catch (error) {
        console.log('Erro ao buscar time: ', error);
        return res.status(500).json({
            status: 'fail',
            message: 'Erro interno ao buscar time',
        });
    };

}

export const updateSubMember = async (req, res) => {
    try {
        
        const {memberId} = req.params;
        const updates = req.body;
        const userId = req.user.id;

        const existingMember = await prisma.subEventTeam.findUnique({
            where: {id: memberId},
            select: { userId: true},
        });

        if(!existingMember) {
            return res.status(404).json({
                status: 'fail',
                message: 'Membro não encontrado',
            });
        }

        if (existingMember.userId !== userId ) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para atualizar este sub-evento'
            });
        }

        const dataToUpdate = {};

        if(updates.name !== undefined)dataToUpdate.name = updates.name.trim();
        if(updates.job !== undefined)dataToUpdate.job = updates.job.trim();
        if (updates.role !== undefined)dataToUpdate.role = updates.role.trim();

        const subMember = await prisma.subEventTeam.update({
            where: { id: memberId },
            data: dataToUpdate,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(200).json({
            status: 'sucess',
            data: {
                subMember,
            },
        });

    } catch (error) {
        console.log("Erro ao atualizar membor do time: ", error);

                if (error.code === 'P2025') {
            return res.status(404).json({
                status: 'fail', 
                message: 'Membro não encontrado',
            });
        }

        res.status(500).json({
            status: 'fail',
            message: 'Erro interno ao atualizar membro'
        })
    }
}

export const deleteSubMember = async (req, res) => {
    try {
        
        const {memberId} = req.params;
        const userId = req.user.id;

        const existingMember = await prisma.subEventTeam.findUnique({
            where: {id: memberId},
            select: { userId: true },
        });

        if (!existingMember){
            return res.status(404).json({
                status: 'fail',
                message: 'Membro não encontrado',
            });
        }

        if (existingMember.userId !== userId) {
            return res.status(403).json({
                status: 'fail',
                message: 'Você não tem permissão para deletar este membro'
            });
        }

        await prisma.subEventTeam.delete({
            where: {id: memberId},
        });
        
        res.status(204).json({
            status: 'sucess',
            data: null,
        });

    } catch (error) {
        console.error('Erro ao deletar membro: ', error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                status: 'fail', 
                message: 'membro não encontrado',
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Erro interno ao deletar membro',
        });
    }
}