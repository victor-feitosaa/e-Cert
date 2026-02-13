import express from "express"
import { createSubEvent, getSubEventsByEvent } from "../controllers/subEventsController.js";
import { canManageSubEvent } from "../middleware/subEventsMiddleware.js";



const router = express.Router();


router.post("/",  createSubEvent);

router.get("/event/:id", getSubEventsByEvent);

export default router;