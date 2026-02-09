import { getTokenFromStorage, getUsuarioFromStorage } from './authStorage';

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

const getEmpresaIdFromStorage = () => {
  if (typeof window === 'undefined') return undefined;
  const usuario = getUsuarioFromStorage<{ empresa_id?: number }>();
  return usuario?.empresa_id as number | undefined;
};

const fetchWithAuth = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const token = getTokenFromStorage();
  const existingHeaders = init.headers instanceof Headers
    ? Object.fromEntries(init.headers.entries())
    : (init.headers || {});
  const headers = {
    ...existingHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(input, { ...init, headers });
};

export const api = {
  // Produtos
  produtos: {
    listar: (empresaId?: number) => {
      const resolvedEmpresaId = empresaId ?? getEmpresaIdFromStorage();
      const qs = resolvedEmpresaId ? `?empresa_id=${resolvedEmpresaId}&t=${Date.now()}` : `?t=${Date.now()}`;
      return fetchWithAuth(`${API_URL}/produtos${qs}`, { cache: 'no-store' }).then(r => r.json());
    },
    buscar: (id: number, empresaId?: number) => {
      const resolvedEmpresaId = empresaId ?? getEmpresaIdFromStorage();
      const qs = resolvedEmpresaId ? `?empresa_id=${resolvedEmpresaId}` : '';
      return fetchWithAuth(`${API_URL}/produtos/${id}${qs}`).then(r => r.json());
    },
    buscarPorCodigo: (codigo: string, empresaId?: number) => {
      const resolvedEmpresaId = empresaId ?? getEmpresaIdFromStorage();
      const qs = resolvedEmpresaId ? `?empresa_id=${resolvedEmpresaId}` : '';
      return fetchWithAuth(`${API_URL}/produtos/codigo/${codigo}${qs}`).then(r => r.json());
    },
    criar: (data: any) => {
      const resolvedEmpresaId = data?.empresa_id ?? getEmpresaIdFromStorage();
      const payload = resolvedEmpresaId ? { ...data, empresa_id: resolvedEmpresaId } : data;
      return fetchWithAuth(`${API_URL}/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
      }).then(r => r.json());
    },
    atualizar: (id: number, data: any) => {
      const resolvedEmpresaId = data?.empresa_id ?? getEmpresaIdFromStorage();
      const payload = resolvedEmpresaId ? { ...data, empresa_id: resolvedEmpresaId } : data;
      return fetchWithAuth(`${API_URL}/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
      }).then(r => r.json());
    },
    deletar: (id: number, empresaId?: number) => {
      const resolvedEmpresaId = empresaId ?? getEmpresaIdFromStorage();
      const qs = resolvedEmpresaId ? `?empresa_id=${resolvedEmpresaId}` : '';
      return fetchWithAuth(`${API_URL}/produtos/${id}${qs}`, {
      method: 'DELETE'
      }).then(r => r.json());
    }
  },

  // Clientes
  clientes: {
    listar: (empresaId?: number) => {
      const resolvedEmpresaId = empresaId ?? getEmpresaIdFromStorage();
      const qs = resolvedEmpresaId ? `?empresa_id=${resolvedEmpresaId}&t=${Date.now()}` : `?t=${Date.now()}`;
      return fetchWithAuth(`${API_URL}/clientes${qs}`, { cache: 'no-store' }).then(r => r.json());
    },
    buscar: (id: number, empresaId?: number) => {
      const resolvedEmpresaId = empresaId ?? getEmpresaIdFromStorage();
      const qs = resolvedEmpresaId ? `?empresa_id=${resolvedEmpresaId}` : '';
      return fetchWithAuth(`${API_URL}/clientes/${id}${qs}`).then(r => r.json());
    },
    criar: (data: any) => {
      const resolvedEmpresaId = data?.empresa_id ?? getEmpresaIdFromStorage();
      const payload = resolvedEmpresaId ? { ...data, empresa_id: resolvedEmpresaId } : data;
      return fetchWithAuth(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
      }).then(r => r.json());
    },
    atualizar: (id: number, data: any) => {
      const resolvedEmpresaId = data?.empresa_id ?? getEmpresaIdFromStorage();
      const payload = resolvedEmpresaId ? { ...data, empresa_id: resolvedEmpresaId } : data;
      return fetchWithAuth(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
      }).then(r => r.json());
    },
    deletar: (id: number, empresaId?: number) => {
      const resolvedEmpresaId = empresaId ?? getEmpresaIdFromStorage();
      const qs = resolvedEmpresaId ? `?empresa_id=${resolvedEmpresaId}` : '';
      return fetchWithAuth(`${API_URL}/clientes/${id}${qs}`, {
      method: 'DELETE'
      }).then(r => r.json());
    }
  },

  // Vendas
  vendas: {
    listar: (empresa_id?: number) => {
      const params = empresa_id ? `?empresa_id=${empresa_id}&t=${Date.now()}` : `?t=${Date.now()}`;
      return fetchWithAuth(`${API_URL}/vendas${params}`, { cache: 'no-store' }).then(r => r.json());
    },
    buscar: (id: number) => fetchWithAuth(`${API_URL}/vendas/${id}`).then(r => r.json()),
    criar: async (data: any) => {
      const response = await fetchWithAuth(`${API_URL}/vendas`, {
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
      return fetchWithAuth(`${API_URL}/vendas/relatorio?${params}`).then(r => r.json());
    }
  },

  // Mesas
  mesas: {
    listarPedidos: (mesaId: number) =>
      fetchWithAuth(`${API_URL}/mesas/${mesaId}/pedidos?t=${Date.now()}`, {
        cache: 'no-store'
      }).then(r => r.json()),
    criarPedido: async (mesaId: number, itens: any[]) => {
      const response = await fetchWithAuth(`${API_URL}/mesas/${mesaId}/pedidos`, {
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
    atualizarStatus: async (mesaId: number, pedidoId: number, status: string) => {
      const response = await fetchWithAuth(`${API_URL}/mesas/${mesaId}/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const raw = await response.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao atualizar status');
      }

      return json;
    },
    cancelarPedido: async (mesaId: number, pedidoId: number) => {
      const response = await fetchWithAuth(`${API_URL}/mesas/${mesaId}/pedidos/${pedidoId}`, {
        method: 'DELETE'
      });

      const raw = await response.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao cancelar pedido');
      }

      return json;
    },
    fecharConta: async (mesaId: number, data: any) => {
      const response = await fetchWithAuth(`${API_URL}/mesas/${mesaId}/fechar-conta`, {
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
        throw new Error(json?.error || 'Erro ao fechar conta');
      }

      return json;
    },
    finalizar: async (mesaId: number) => {
      const response = await fetchWithAuth(`${API_URL}/mesas/${mesaId}/finalizar`, {
        method: 'POST'
      });

      const raw = await response.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao finalizar mesa');
      }

      return json;
    }
  },

  // Funcionários
  funcionarios: {
    listar: () => fetchWithAuth(`${API_URL}/funcionarios`).then(r => r.json()),
    buscar: (id: number) => fetchWithAuth(`${API_URL}/funcionarios/${id}`).then(r => r.json()),
    login: (usuario: string, senha: string) => {
      const empresa_id = getEmpresaIdFromStorage();
      return fetchWithAuth(`${API_URL}/funcionarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha, empresa_id })
      }).then(r => r.json());
    },
    criar: (data: any) => fetchWithAuth(`${API_URL}/funcionarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    atualizar: (id: number, data: any) => fetchWithAuth(`${API_URL}/funcionarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    deletar: (id: number) => fetchWithAuth(`${API_URL}/funcionarios/${id}`, {
      method: 'DELETE'
    }).then(r => r.json()),
    ativar: (id: number) => fetchWithAuth(`${API_URL}/funcionarios/${id}/ativar`, {
      method: 'PATCH'
    }).then(r => r.json())
  },

  // Empresas
  empresas: {
    listar: () => fetchWithAuth(`${API_URL}/empresas`).then(r => r.json()),
    buscar: (id: number) => fetchWithAuth(`${API_URL}/empresas/${id}`).then(r => r.json()),
    criar: async (data: any) => {
      const response = await fetchWithAuth(`${API_URL}/empresas`, {
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
      const response = await fetchWithAuth(`${API_URL}/empresas/${id}`, {
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
    deletar: (id: number) => fetchWithAuth(`${API_URL}/empresas/${id}`, {
      method: 'DELETE'
    }).then(r => r.json()),
    estatisticas: () => fetchWithAuth(`${API_URL}/empresas/estatisticas`).then(r => r.json())
  },

  // Planos
  planos: {
    listar: () => fetchWithAuth(`${API_URL}/planos`).then(r => r.json()),
    buscar: (id: number) => fetchWithAuth(`${API_URL}/planos/${id}`).then(r => r.json()),
    criar: (data: any) => fetchWithAuth(`${API_URL}/planos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    atualizar: (id: number, data: any) => fetchWithAuth(`${API_URL}/planos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    deletar: (id: number) => fetchWithAuth(`${API_URL}/planos/${id}`, {
      method: 'DELETE'
    }).then(r => r.json())
  },

  // Autenticação
  auth: {
    login: async (email: string, senha: string, empresaId?: number) => {
      const attempt = async (baseUrl: string) => {
        const response = await fetchWithAuth(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha, empresa_id: empresaId })
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
      const response = await fetchWithAuth(`${API_URL}/auth/usuarios`, {
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
    listarUsuarios: (empresa_id: number) => fetchWithAuth(`${API_URL}/auth/usuarios/${empresa_id}`).then(r => r.json()),
    deletarUsuario: (id: number) => fetchWithAuth(`${API_URL}/auth/usuarios/${id}`, {
      method: 'DELETE'
    }).then(r => r.json()),
    verificar: () => {
      return fetchWithAuth(`${API_URL}/auth/verificar`).then(r => r.json());
    }
  },

  // Caixa
  caixa: {
    listarFechamentos: (empresa_id?: number, operador_nome?: string) => {
      const params = new URLSearchParams();
      if (empresa_id) params.append('empresa_id', String(empresa_id));
      if (operador_nome) params.append('operador_nome', operador_nome);
      const qs = params.toString();
      return fetchWithAuth(`${API_URL}/caixa/fechamentos${qs ? `?${qs}` : ''}`).then(r => r.json());
    },
    criarFechamento: (data: any) => fetchWithAuth(`${API_URL}/caixa/fechamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  }
};
