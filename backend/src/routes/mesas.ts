import express from 'express';
const router = express.Router();

// Simulação de pedidos por mesa em memória
const pedidosPorMesa: Record<string, any[]> = {};

// Criar pedido para uma mesa
router.post('/:mesaId/pedidos', (req, res) => {
  const { mesaId } = req.params;
  const { itens } = req.body;
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'Itens do pedido obrigatórios' });
  }
  if (!pedidosPorMesa[mesaId]) pedidosPorMesa[mesaId] = [];
  const pedido = { id: Date.now(), itens, status: 'pendente', criado_em: new Date() };
  pedidosPorMesa[mesaId].push(pedido);
  res.status(201).json(pedido);
});


// Listar pedidos de uma mesa
router.get('/:mesaId/pedidos', (req, res) => {
  const { mesaId } = req.params;
  res.json(pedidosPorMesa[mesaId] || []);
});

// Atualizar status do pedido
router.patch('/:mesaId/pedidos/:pedidoId', (req, res) => {
  const { mesaId, pedidoId } = req.params;
  const { status } = req.body;
  const pedidos = pedidosPorMesa[mesaId] || [];
  const pedido = pedidos.find(p => String(p.id) === String(pedidoId));
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
  if (status) pedido.status = status;
  res.json(pedido);
});

export default router;
