import express from 'express';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/usuarios', AuthController.criarUsuario);
router.get('/usuarios/:empresa_id', AuthController.listarUsuarios);
router.delete('/usuarios/:id', AuthController.deletarUsuario);
router.get('/verificar', AuthController.verificarToken);

export default router;
