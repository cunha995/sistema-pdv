import express from 'express';
import { PlanoController } from '../controllers/PlanoController';

const router = express.Router();

router.get('/', PlanoController.listar);
router.get('/:id', PlanoController.buscar);
router.post('/', PlanoController.criar);
router.put('/:id', PlanoController.atualizar);
router.delete('/:id', PlanoController.deletar);

export default router;
