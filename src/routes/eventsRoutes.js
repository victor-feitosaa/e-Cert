import express from 'express';
import { getEvents } from '../controllers/eventsController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "Events home" });
});

router.get("/list", async (req, res) => {
  
  res.json({ message: "List of events", events: [
    await getEvents(req, res)
  ] });
});

export default router;