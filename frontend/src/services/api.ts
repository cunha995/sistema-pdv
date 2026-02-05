const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? '/api' : 'https://sistema-pdv-backend.onrender.com/api');

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
  },

  // Funcionários
  funcionarios: {
    listar: () => fetch(`${API_URL}/funcionarios`).then(r => r.json()),
    buscar: (id: number) => fetch(`${API_URL}/funcionarios/${id}`).then(r => r.json()),
    criar: (data: any) => fetch(`${API_URL}/funcionarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    atualizar: (id: number, data: any) => fetch(`${API_URL}/funcionarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    deletar: (id: number) => fetch(`${API_URL}/funcionarios/${id}`, {
      method: 'DELETE'
    }).then(r => r.json()),
    ativar: (id: number) => fetch(`${API_URL}/funcionarios/${id}/ativar`, {
      method: 'PATCH'
    }).then(r => r.json())
  },

  // Empresas
  empresas: {
    listar: () => fetch(`${API_URL}/empresas`).then(r => r.json()),
    buscar: (id: number) => fetch(`${API_URL}/empresas/${id}`).then(r => r.json()),
    criar: async (data: any) => {
      const response = await fetch(`${API_URL}/empresas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Erro ao criar empresa');
      }
      return json;
    },
    atualizar: async (id: number, data: any) => {
      const response = await fetch(`${API_URL}/empresas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Erro ao atualizar empresa');
      }
      return json;
    },
    deletar: (id: number) => fetch(`${API_URL}/empresas/${id}`, {
      method: 'DELETE'
    }).then(r => r.json()),
    estatisticas: () => fetch(`${API_URL}/empresas/estatisticas`).then(r => r.json())
  },

  // Planos
  planos: {
    listar: () => fetch(`${API_URL}/planos`).then(r => r.json()),
    buscar: (id: number) => fetch(`${API_URL}/planos/${id}`).then(r => r.json()),
    criar: (data: any) => fetch(`${API_URL}/planos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    atualizar: (id: number, data: any) => fetch(`${API_URL}/planos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    deletar: (id: number) => fetch(`${API_URL}/planos/${id}`, {
      method: 'DELETE'
    }).then(r => r.json())
  },

  // Autenticação
  auth: {
    login: (email: string, senha: string) => fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    }).then(r => r.json()),
    criarUsuario: async (data: any) => {
      const response = await fetch(`${API_URL}/auth/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Erro ao criar usuário');
      }
      return json;
    },
    listarUsuarios: (empresa_id: number) => fetch(`${API_URL}/auth/usuarios/${empresa_id}`).then(r => r.json()),
    deletarUsuario: (id: number) => fetch(`${API_URL}/auth/usuarios/${id}`, {
      method: 'DELETE'
    }).then(r => r.json()),
    verificar: () => {
      const token = localStorage.getItem('token');
      return fetch(`${API_URL}/auth/verificar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());
    }
  }
};
