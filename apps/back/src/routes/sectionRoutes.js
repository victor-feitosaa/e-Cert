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
  enrollInSection,
  leaveSection,
  checkSectionEnrollment,
  getPublicSections,
  getUserSectionStatus
} from '../controllers/sectionController.js'

const router = express.Router({ mergeParams: true })

// ✅ Rota pública (NÃO usa protect)
router.get('/public', getPublicSections)

// Rotas protegidas
router.use(protect)

router.get('/', getSections)
router.post('/', createSection)
router.get('/:id', getSectionById)
router.put('/:id', updateSection)
router.patch('/:id', updateSection)
router.delete('/:id', deleteSection)
router.delete('/', deleteAllSectionsFromSubEvent)
router.post('/:id/enroll', enrollInSection)
router.delete('/:id/leave', leaveSection)
router.get('/:id/check', checkSectionEnrollment)
router.get('/user-status', getUserSectionStatus)

export default router