import express from 'express'
import { createSubEvent, deleteSubEvent, getSubEvents , updateSubEvent} from '../controllers/subEventsController.js'
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);


router.get('/:id', getSubEvents);

router.post('/',  createSubEvent);

router.put('/:id', updateSubEvent);

router.delete('/:id', deleteSubEvent);

export default router;