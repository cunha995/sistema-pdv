export interface Produto {
  id?: number;
  empresa_id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  codigo_barras?: string;
  estoque: number;
  categoria?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Cliente {
  id?: number;
  empresa_id?: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItemVenda {
  id?: number;
  venda_id?: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Venda {
  id?: number;
  empresa_id?: number;
  cliente_id?: number;
  total: number;
  desconto?: number;
  metodo_pagamento?: string;
  observacoes?: string;
  created_at?: string;
  itens: ItemVenda[];
}
