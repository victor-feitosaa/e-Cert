import { prisma } from "../config/db.js"
import EventRoleService from "../services/EventRoleService.js"


export const convidarMod = async (req, res) => {

    const eventId = '0077e48e-0ad1-4b53-9094-e33433c192ad'
    const userId = '3e579917-f227-496c-a334-beba5e853324'
    const email = 'contatomatheusss+1@gmail.com'

    const invite = await EventRoleService.inviteModerator(eventId, email, userId);



}