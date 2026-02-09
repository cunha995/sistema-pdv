import { Router } from 'express';
import { VendaController } from '../controllers/VendaController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', VendaController.listar);
router.get('/relatorio', VendaController.relatorio);
router.get('/:id', VendaController.buscarPorId);
router.post('/', VendaController.criar);

export default router;
