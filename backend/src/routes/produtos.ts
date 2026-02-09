import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use((req, res, next) => {
	const hasToken = !!req.headers.authorization;
	if (hasToken) {
		return requireAuth(req, res, next);
	}

	if (req.method === 'GET') {
		return next();
	}

	return res.status(401).json({ error: 'Token não fornecido' });
});

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);
router.get('/codigo/:codigo', ProdutoController.buscarPorCodigoBarras);
router.post('/', ProdutoController.criar);
router.put('/:id', ProdutoController.atualizar);
router.delete('/:id', ProdutoController.deletar);
router.patch('/:id/estoque', ProdutoController.atualizarEstoque);

export default router;
