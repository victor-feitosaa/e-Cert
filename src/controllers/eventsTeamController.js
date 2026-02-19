import { prisma } from "../config/db.js"

export const createTeam = async (req, res) => {

    try {
        
        const {name,  role, job, userId, eventId} = req.body;
    
        const event = await prisma.event.findUnique({
            where : {id: eventId}
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