import express from 'express';
import { FuncionarioController } from '../controllers/FuncionarioController';

const router = express.Router();

router.get('/', FuncionarioController.listar);
router.get('/:id', FuncionarioController.buscar);
router.post('/', FuncionarioController.criar);
router.put('/:id', FuncionarioController.atualizar);
router.delete('/:id', FuncionarioController.deletar);
router.patch('/:id/ativar', FuncionarioController.ativar);

export default router;
