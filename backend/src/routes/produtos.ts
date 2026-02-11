import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import { ProdutoController } from '../controllers/ProdutoController';
import { getAuthContext, requireAuth } from '../middleware/auth';
import { ensureEmpresaUploadsDir } from '../utils/uploads';

const router = Router();

const storage = multer.diskStorage({
	destination: (req, _file, cb) => {
		const auth = getAuthContext(req);
		if (!auth) {
			return cb(new Error('Token não fornecido'), '');
		}
		const dir = ensureEmpresaUploadsDir(auth.empresaId);
		return cb(null, dir);
	},
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname || '').toLowerCase();
		const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, safeName);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 3 * 1024 * 1024 },
	fileFilter: (_req, file, cb) => {
		if (file.mimetype?.startsWith('image/')) {
			return cb(null, true);
		}
		return cb(new Error('Arquivo invalido'));
	}
});

router.use(requireAuth);

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);
router.get('/codigo/:codigo', ProdutoController.buscarPorCodigoBarras);
router.post('/', ProdutoController.criar);
router.put('/:id', ProdutoController.atualizar);
router.post('/:id/imagem', upload.single('imagem'), ProdutoController.atualizarImagem);
router.delete('/:id', ProdutoController.deletar);
router.patch('/:id/estoque', ProdutoController.atualizarEstoque);

export default router;
