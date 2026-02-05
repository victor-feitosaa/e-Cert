import express from "express"
import { register, login , logout } from "../controllers/authController.js"
import { addToSubEvents } from "../controllers/subEventsController.js";

const router = express.Router();

router.post("/createSub", addToSubEvents)