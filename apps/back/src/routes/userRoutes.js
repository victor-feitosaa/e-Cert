import express from 'express'
import { protect } from "../middleware/authMiddleware.js";
import { GetUserData } from '../controllers/userController.js';

const router = express.Router();

router.use(protect)

router.get("/", GetUserData)

export default router;