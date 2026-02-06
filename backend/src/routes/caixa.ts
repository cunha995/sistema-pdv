import express from 'express';
import { CaixaController } from '../controllers/CaixaController';

const router = express.Router();

router.get('/fechamentos', CaixaController.listar);
router.post('/fechamentos', CaixaController.criar);

export default router;
