import { prisma } from "../config/db.js"
import eventPermissionService from "../services/eventPermissionService.js"


export const convidarMod = async (req, res) => {

    const eventId = '0077e48e-0ad1-4b53-9094-e33433c192ad'
    const userId = '3e579917-f227-496c-a334-beba5e853324'
    const email = 'victor.victorfeitosa@outlook.com'

    const invite = await eventPermissionService.inviteModerator(eventId, email, userId);



}