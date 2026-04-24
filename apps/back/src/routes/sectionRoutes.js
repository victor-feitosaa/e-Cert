// src/routes/sectionRoutes.js
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
  deleteAllSectionsFromSubEvent
} from '../controllers/sectionController.js'

const router = express.Router({ mergeParams: true })

// Todas as rotas de seção requerem autenticação
router.use(protect)

// Rotas para seções
router.route('/')
  .post(createSection)      // Criar seção
  .get(getSections)          // Listar seções do subevento
  .delete(deleteAllSectionsFromSubEvent) // Deletar todas as seções

router.route('/:id')
  .get(getSectionById)       // Buscar seção por ID
  .put(updateSection)        // Atualizar seção
  .patch(updateSection)      // Atualização parcial
  .delete(deleteSection)     // Deletar seção

export default router