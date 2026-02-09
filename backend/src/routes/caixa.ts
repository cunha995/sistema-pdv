import express from 'express';
import { CaixaController } from '../controllers/CaixaController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.use(requireAuth);

router.get('/fechamentos', CaixaController.listar);
router.post('/fechamentos', CaixaController.criar);

export default router;
