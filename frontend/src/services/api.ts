const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // Produtos
  produtos: {
    listar: () => fetch(`${API_URL}/produtos`).then(r => r.json()),
    buscar: (id: number) => fetch(`${API_URL}/produtos/${id}`).then(r => r.json()),
    buscarPorCodigo: (codigo: string) => fetch(`${API_URL}/produtos/codigo/${codigo}`).then(r => r.json()),
    criar: (data: any) => fetch(`${API_URL}/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    atualizar: (id: number, data: any) => fetch(`${API_URL}/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    deletar: (id: number) => fetch(`${API_URL}/produtos/${id}`, {
      method: 'DELETE'
    }).then(r => r.json())
  },

  // Clientes
  clientes: {
    listar: () => fetch(`${API_URL}/clientes`).then(r => r.json()),
    buscar: (id: number) => fetch(`${API_URL}/clientes/${id}`).then(r => r.json()),
    criar: (data: any) => fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    atualizar: (id: number, data: any) => fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    deletar: (id: number) => fetch(`${API_URL}/clientes/${id}`, {
      method: 'DELETE'
    }).then(r => r.json())
  },

  // Vendas
  vendas: {
    listar: () => fetch(`${API_URL}/vendas`).then(r => r.json()),
    buscar: (id: number) => fetch(`${API_URL}/vendas/${id}`).then(r => r.json()),
    criar: (data: any) => fetch(`${API_URL}/vendas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    relatorio: (dataInicio?: string, dataFim?: string) => {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      return fetch(`${API_URL}/vendas/relatorio?${params}`).then(r => r.json());
    }
  },

  // Mesas
  mesas: {
    listarPedidos: (mesaId: number) => fetch(`${API_URL}/mesas/${mesaId}/pedidos`).then(r => r.json()),
    fecharConta: (mesaId: number, data: any) => fetch(`${API_URL}/mesas/${mesaId}/fechar-conta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  }
};
