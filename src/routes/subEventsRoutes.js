import express from 'express'
import { createSubEvent, deleteSubEvent, getSubEvents , updateSubEvent} from '../controllers/subEventsController.js'
import { protect } from '../middleware/authMiddleware.js';
import { createSubMember, deleteSubMember, getMyTeam, updateSubMember } from '../controllers/subEventsTeamController.js';

const router = express.Router();

router.use(protect);


router.get('/:id', getSubEvents);
router.post('/:eventId',  createSubEvent);
router.put('/:id', updateSubEvent);
router.delete('/:id', deleteSubEvent);

//members
router.post('/:subEventId/createMember', createSubMember);
router.get('/:subEventId/myTeam', getMyTeam);
router.put('/:memberId/updateMember', updateSubMember);
router.delete('/member/:memberId',  deleteSubMember);


export default router;