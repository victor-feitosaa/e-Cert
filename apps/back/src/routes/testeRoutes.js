import { convidarMod } from "../controllers/testController.js";
import express from 'express'

const router = express.Router();
//TESTES
router.get('/testeGet', convidarMod)

export default router;