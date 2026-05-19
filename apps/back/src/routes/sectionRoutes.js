// src/routes/sectionRoutes.js
import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
  deleteAllSectionsFromSubEvent,
  enrollInSection,        // ← NOVO
  leaveSection,           // ← NOVO
  checkSectionEnrollment  // ← NOVO
} from '../controllers/sectionController.js'

const router = express.Router({ mergeParams: true })

// Todas as rotas de seção requerem autenticação
router.use(protect)

// Rotas para seções
router.route('/')
  .post(createSection)
  .get(getSections)
  .delete(deleteAllSectionsFromSubEvent)

router.route('/:id')
  .get(getSectionById)
  .put(updateSection)
  .patch(updateSection)
  .delete(deleteSection)

// ── NOVAS ROTAS PARA INSCRIÇÃO ──
router.post('/:id/enroll', enrollInSection)           // Inscrever em seção
router.delete('/:id/leave', leaveSection)             // Sair da seção
router.get('/:id/check', checkSectionEnrollment)      // Verificar inscrição

export default router