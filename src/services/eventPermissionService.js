import {EventRole} from "@prisma/client"
import {prisma} from "../config/db.js"
import nodemailer from "nodemailer"

class EventPermissionService {


    async assignOrganizerRole(userId, eventId) {

        try {
            const existing = await prisma.eventPermission.findUnique({
                where: {
                    userId_eventId: {
                        userId,
                        eventId

                    }
                }
            });

            if (existing) {
                console.log(`User ${userId} já tem permissão no evento ${eventId}`)
                return existing;
            }

            //criar permissão de organizer
            const permission = await prisma.eventPermission.create({
                data: {
                    userId,
                    eventId,
                    role: 'ORGANIZER',
                    grantedBy: userId,
                    grantedAt: new Date()
                },
                include: {
                    user: {
                        select: {id: true, name: true, email: true}
                    },
                    event: {
                        select: {id: true, title: true}
                    }
                }
            });

            console.log(`Organizer role atribuída: User ${userId} no Evento ${eventId}`);
            return permission;

        } catch (error) {
            console.log('Erro ao atribuir organizer role: ', error)
            throw error;
        }
    };

    async isOrganizer(userId, eventId) {

        return await this.hasRole(userId, eventId, 'ORGANIZER');


    };

    async isModerator(userId, eventId) {

        return await this.hasRole(userId, eventId, 'MODERATOR');
    }


    async hasRole(userId, eventId, role) {

        try {
            const permission = await prisma.eventPermission.findFirst({
                where: {
                    userId: userId,
                    eventId: eventId,
                    role: role
                }
            });
            return !!permission

        } catch (error) {
            console.error("Erro ao verificar se é organizer: ", error);

        }
        return false;


    }


    async inviteModerator(eventId, email, granter) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    email
                },
                select: {
                    id: true
                }
            });

            if (!existingUser) {
                console.log("User não existe no sistema");

                const senhaTemp = Math.random().toString(36).slice(-10);

                const user = await prisma.user.create({
                    data: {
                        email,
                        password: senhaTemp,
                        status: 'PARCIAL'
                    }
                })

                console.log(`Conta parcial criada para o email ${email}`);

                const permission = await prisma.eventPermission.create({
                    data: {
                        eventId,
                        userId: user.id,
                        role: 'MODERATOR',
                        grantedBy: granter
                    }

                })

                console.log(`Role Moderator definido para conta parcial ${user.id}`)

                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'mail.cert.e@gmail.com',
                        pass: 'iafdcbjjvyumyomf'
                    }
                });

                let mailOptions = {
                    from: 'mail.cert.e@gmail.com',
                    to: email,
                    subject: 'Convite para Moderador',
                    text: 'Fulano de tal te convidou para ser moderador do evento dele',
                    html: '<b>Fulano de tal te convidou para ser moderador do evento dele</b>'
                };

                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Email enviado: ' + info.response);
                });
            }

            if (existingUser) {
                console.log("User existe no sistema")

                const isModerator = await this.isModerator(existingUser.id, eventId);

                if (!isModerator) {
                    const permission = await prisma.eventPermission.create({
                        data: {
                            eventId,
                            userId: existingUser.id,
                            role: 'MODERATOR',
                            grantedBy: granter
                        }
                    })

                    console.log(`O user ${userId} agora é moderador do evento ${eventId}`);

                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'mail.cert.e@gmail.com',
                            pass: 'iafdcbjjvyumyomf'
                        }
                    });

                    let mailOptions = {
                        from: 'mail.cert.e@gmail.com',
                        to: email,
                        subject: 'Convite para Moderador',
                        text: 'Fulano de tal te convidou para ser moderador do evento dele',
                        html: '<b>Fulano de tal te convidou para ser moderador do evento dele</b>'
                    };

                    await transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Email enviado: ' + info.response);
                    });

                }
            }

        } catch (error) {
            console.log('Erro ao convidar moderador ', error)
        }
    }


}

export default new EventPermissionService();