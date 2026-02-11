import express from 'express';
import { PublicController } from '../controllers/PublicController';

const router = express.Router();

router.get('/empresas/:empresa_id/produtos', PublicController.listarProdutos);
router.get('/mesas/:mesa_id/pedidos', PublicController.listarPedidos);
router.post('/mesas/:mesa_id/pedidos', PublicController.criarPedido);
router.post('/mesas/:mesa_id/chamar-atendente', PublicController.chamarAtendente);
router.post('/mesas/:mesa_id/fechar-conta', PublicController.fecharConta);

export default router;
