import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';

const router = Router();

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);
router.get('/codigo/:codigo', ProdutoController.buscarPorCodigoBarras);
router.post('/', ProdutoController.criar);
router.put('/:id', ProdutoController.atualizar);
router.delete('/:id', ProdutoController.deletar);
router.patch('/:id/estoque', ProdutoController.atualizarEstoque);

export default router;
