import { prisma } from "../config/db.js"

export const createTeam = async (req, res) => {

    try {
        
        const {name,  role, job, userId} = req.body;

        const {id} = req.params;
    
        const event = await prisma.event.findUnique({
            where : {id}
        });
    
        if (!event) {
            return res.status(404).json({
                status: "fail",
                message: "Evento não encontrado"
            });
        };
    
        console.log(event);

        if (!userId) {
            return res.status(404).json({
                status: "fail",
                message: "User não validado"
            })
        };
    
        if (!name?.trim()) {
            return res.status(404).json({
                status: "fail",
                message: "É obrigatório informar um nome"
            })
        };
    

    
        if (!job?.trim()) {
            return res.status(404).json({
                status: "fail",
                message: "É obrigatório informar uma função"
            })
        };
    
        const team = await prisma.eventTeam.create({
            data: {
                name,
                role,
                job,
                eventId: event.id,
                userId
            },
        });
    
        res.status(201).json({
            status: "sucess",
            message: "Time criado: ",
            data: {team}
        });


    } catch (error) {
        console.log("Erro ao criar time ", error);
        res.status(500).json({
            status: "fail",
            message: "Erro ao criar time"
        });
    }

}

export const getMyTeam = async (req, res) => {
    try {
        const {id} = req.params;

        const team = await prisma.eventTeam.findMany({
            where: { eventId: id },
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
        console.log("olha:", team.userId)

        // if (!req.user || req.user.id !== team.userId) {
        //     return res.status(403).json({
        //         status: 'fail',
        //         message: 'Você não tem permissão para acessar este evento',
        //     });
        // }


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

