import express from 'express';
import { MesaController } from '../controllers/MesaController';
const router = express.Router();

// Criar pedido para uma mesa
router.post('/:mesa_id/pedidos', MesaController.criarPedido);

// Listar histórico de pedidos da mesa
router.get('/:mesa_id/pedidos', MesaController.listarPedidos);

// Atualizar status do pedido
router.patch('/:mesa_id/pedidos/:pedido_id', MesaController.atualizarStatusPedido);

// Chamar atendente
router.post('/:mesa_id/chamar-atendente', MesaController.chamarAtendente);

// Fechar conta (consolidar pedidos em venda)
router.post('/:mesa_id/fechar-conta', MesaController.fecharConta);

export default router;
