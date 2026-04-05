import userService from "../services/userService.js"

export const GetUserData = async (req, res) => {
    try {
        const id = req.user.id
        

        const data = await userService.GetUserData(id);
        
        if(!data) {
            return res.status(404).json({
                status: 'fail',
                message: 'Dados não encontrados',
            });
        }

        res.status(200).json({
            status:'sucess',
            data:{
                data
            }
        })
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({
        status: 'error',
        message: 'Erro interno ao buscar dados de usuário',
        });
  }
}
