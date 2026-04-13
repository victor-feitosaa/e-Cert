// import { prisma } from "../config/db.js"
// import EventRoleService from "../eventRoleService.js"
// import userService from "../services/userService.js"


// export const convidarMod = async (req, res) => {

//     const eventId = '0077e48e-0ad1-4b53-9094-e33433c192ad'
//     const userId = '3e579917-f227-496c-a334-beba5e853324'
//     const email = 'contatomatheusss+1@gmail.com'

//     const invite = await EventRoleService.inviteModerator(eventId, email, userId);



// }

// export const GetUserData = async (req, res) => {
//     try {
//         const id = req.user.id
//         console.log('AQUI',id)

//         const data = await userService.GetUserData(id);
        
//         if(!data) {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'Dados não encontrados',
//             });
//         }

//         res.status(200).json({
//             status:'sucess',
//             data:{
//                 data
//             }
//         })
//     } catch (error) {
//         console.error('Erro ao buscar dados:', error);
//         res.status(500).json({
//         status: 'error',
//         message: 'Erro interno ao buscar dados de usuário',
//         });
//   }
// }

