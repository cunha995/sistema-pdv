const FALLBACK_API_URL = 'https://sistema-pdv-backend.onrender.com/api';
const RAW_API_URL = import.meta.env.VITE_API_URL;
const IS_DEV = import.meta.env.MODE === 'development';

const resolveApiUrl = () => {
  if (!RAW_API_URL) {
    return IS_DEV ? '/api' : FALLBACK_API_URL;
  }

  if (RAW_API_URL === '/api') {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (host && host.endsWith('onrender.com')) {
      return FALLBACK_API_URL;
    }
  }

  return RAW_API_URL;
};

export const API_URL = resolveApiUrl();

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
    listar: (empresa_id?: number) => {
      const params = empresa_id ? `?empresa_id=${empresa_id}` : '';
      return fetch(`${API_URL}/vendas${params}`).then(r => r.json());
    },
    buscar: (id: number) => fetch(`${API_URL}/vendas/${id}`).then(r => r.json()),
    criar: async (data: any) => {
      const response = await fetch(`${API_URL}/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const raw = await response.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao finalizar venda');
      }

      if (!json) {
        throw new Error('Resposta inválida do servidor');
      }

      return json;
    },
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
    criarPedido: async (mesaId: number, itens: any[]) => {
      const response = await fetch(`${API_URL}/mesas/${mesaId}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens })
      });

      const raw = await response.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao enviar pedido');
      }

      return json;
    },
    atualizarStatus: (mesaId: number, pedidoId: number, status: string) => fetch(`${API_URL}/mesas/${mesaId}/pedidos/${pedidoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(r => r.json()),
    fecharConta: (mesaId: number, data: any) => fetch(`${API_URL}/mesas/${mesaId}/fechar-conta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    finalizar: (mesaId: number) => fetch(`${API_URL}/mesas/${mesaId}/finalizar`, {
      method: 'POST'
    }).then(r => r.json())
  },

  // Funcionários
  funcionarios: {
    listar: () => fetch(`${API_URL}/funcionarios`).then(r => r.json()),
    buscar: (id: number) => fetch(`${API_URL}/funcionarios/${id}`).then(r => r.json()),
    login: (usuario: string, senha: string) => fetch(`${API_URL}/funcionarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    }).then(r => r.json()),
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
    login: async (email: string, senha: string) => {
      const attempt = async (baseUrl: string) => {
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const raw = await response.text();
        const contentType = response.headers.get('content-type') || '';
        let json: any = null;
        try {
          json = raw ? JSON.parse(raw) : null;
        } catch {
          json = null;
        }

        const isHtml = contentType.includes('text/html') || raw.trim().startsWith('<!DOCTYPE') || raw.trim().startsWith('<html');

        if (!response.ok) {
          return { ok: false, json, isHtml };
        }

        if (!json) {
          return { ok: false, json: { error: 'Resposta inválida do servidor' }, isHtml };
        }

        return { ok: true, json, isHtml };
      };

      try {
        const first = await attempt(API_URL);
        if (first.ok) return first.json;

        const shouldFallback = API_URL.startsWith('/api') || first.isHtml;
        if (shouldFallback && FALLBACK_API_URL !== API_URL) {
          const second = await attempt(FALLBACK_API_URL);
          if (second.ok) return second.json;
          throw new Error(second.json?.error || 'Erro ao fazer login');
        }

        throw new Error(first.json?.error || 'Erro ao fazer login');
      } catch (error) {
        throw error;
      }
    },
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
  },

  // Caixa
  caixa: {
    listarFechamentos: (empresa_id?: number, operador_nome?: string) => {
      const params = new URLSearchParams();
      if (empresa_id) params.append('empresa_id', String(empresa_id));
      if (operador_nome) params.append('operador_nome', operador_nome);
      const qs = params.toString();
      return fetch(`${API_URL}/caixa/fechamentos${qs ? `?${qs}` : ''}`).then(r => r.json());
    },
    criarFechamento: (data: any) => fetch(`${API_URL}/caixa/fechamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  }
};
