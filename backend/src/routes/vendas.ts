import { Router } from 'express';
import { VendaController } from '../controllers/VendaController';

const router = Router();

router.get('/', VendaController.listar);
router.get('/relatorio', VendaController.relatorio);
router.get('/:id', VendaController.buscarPorId);
router.post('/', VendaController.criar);

export default router;
