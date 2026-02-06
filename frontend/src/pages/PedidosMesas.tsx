
import { api } from '../services/api';
import { Produto } from '../types';

const mesas = [
  { id: 1, nome: 'Mesa 1' },
  { id: 2, nome: 'Mesa 2' },
  { id: 3, nome: 'Mesa 3' },
  { id: 4, nome: 'Mesa 4' }
];

const PedidosMesas: React.FC = () => {
  const [pedidos, setPedidos] = useState<Record<string, any[]>>({});
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarPedidos = async () => {
    setLoading(true);
    const result: Record<string, any[]> = {};
    for (const mesa of mesas) {
      const resp = await fetch(`/api/mesas/${mesa.id}/pedidos`);
      result[mesa.id] = await resp.json();
    }
    setPedidos(result);
    setLoading(false);
  };

  useEffect(() => {
    carregarPedidos();
    api.produtos.listar().then(setProdutos);
    const interval = setInterval(carregarPedidos, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  const nomeProduto = (id: number) => {
    const p = produtos.find(p => p.id === id);
    return p ? p.nome : `Produto #${id}`;
  };

  const atualizarStatus = async (mesaId: number, pedidoId: number, status: string, mensagemCliente: string) => {
    await fetch(`/api/mesas/${mesaId}/pedidos/${pedidoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    carregarPedidos();
    window.alert(mensagemCliente);
  };

  return (
    <div className="pedidos-mesas-main">
      <h1>Pedidos por Mesa</h1>
      {loading && <div>Carregando...</div>}
      <div className="mesas-pedidos-list">
        {mesas.map(mesa => (
          <div key={mesa.id} className="mesa-pedidos-card">
            <h2>{mesa.nome}</h2>
            <ul>
              {(pedidos[mesa.id] || []).map(pedido => (
                <li key={pedido.id}>
                  <b>Pedido #{pedido.id}</b> - <span className={`status-${pedido.status}`}>{pedido.status}</span> <br />
                  {pedido.itens.map((item: any, idx: number) => (
                    <span key={idx}>{nomeProduto(item.produto_id)} x {item.quantidade}<br /></span>
                  ))}
                  <small>{new Date(pedido.criado_em).toLocaleString()}</small>
                  <div style={{marginTop: 4}}>
                    {pedido.status !== 'entregue' && (
                      <>
                        {pedido.status === 'pendente' && (
                          <button onClick={() => atualizarStatus(mesa.id, pedido.id, 'aceito', 'Cliente notificado: Pedido aceito!')}>
                            Aceitar Pedido
                          </button>
                        )}
                        {pedido.status !== 'pronto' && (
                          <button
                            onClick={() => atualizarStatus(mesa.id, pedido.id, 'preparando', 'Cliente notificado: Pedido em preparo!')}
                            style={{marginLeft: 8}}
                          >
                            Marcar como Preparando
                          </button>
                        )}
                        <button
                          onClick={() => atualizarStatus(mesa.id, pedido.id, 'pronto', 'Cliente notificado: Pedido pronto!')}
                          style={{marginLeft: 8}}
                        >
                          Marcar como Pronto
                        </button>
                        <button
                          onClick={() => atualizarStatus(mesa.id, pedido.id, 'entregue', 'Cliente notificado: Pedido entregue!')}
                          style={{marginLeft: 8}}
                        >
                          Marcar como Entregue
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
              {(pedidos[mesa.id] || []).length === 0 && <li>Nenhum pedido</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PedidosMesas;
