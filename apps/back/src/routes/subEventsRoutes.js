import express from 'express'
import { createSubEvent, deleteSubEvent, getSubEvents , updateSubEvent} from '../controllers/subEventsController.js'
import { protect } from '../middleware/authMiddleware.js';
import { createSubMember, deleteSubMember, getMyTeam, updateSubMember } from '../controllers/subEventsTeamController.js';
import { hasRole } from '../middleware/roleMiddleware.js';
import { createSection, deleteSection, getSections, updateSection } from '../controllers/sectionController.js';

const router = express.Router();

router.use(protect);


router.get('/:id', getSubEvents);
router.post('/:id', hasRole,  createSubEvent);
router.put('/:id',  updateSubEvent);
router.delete('/:id', deleteSubEvent);

//members
router.post('/:subEventId/createMember', createSubMember);
router.get('/:subEventId/myTeam', getMyTeam);
router.put('/:memberId/updateMember', updateSubMember);
router.delete('/member/:memberId',  deleteSubMember);



router.post('/:subEventId/sections', createSection);
router.get('/:subEventId/sections', getSections);
router.put('/:subEventId/sections/:sectionId', updateSection);
router.delete('/:subEventId/sections/:sectionId', deleteSection);


export default router;