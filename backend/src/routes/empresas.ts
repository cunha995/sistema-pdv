import express from 'express';
import { EmpresaController } from '../controllers/EmpresaController';

const router = express.Router();

router.get('/', EmpresaController.listar);
router.get('/estatisticas', EmpresaController.estatisticas);
router.get('/:id', EmpresaController.buscar);
router.post('/', EmpresaController.criar);
router.put('/:id', EmpresaController.atualizar);
router.delete('/:id', EmpresaController.deletar);

export default router;
