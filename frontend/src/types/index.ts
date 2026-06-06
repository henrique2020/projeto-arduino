// API response types

export interface Item {
  id: string; // Format: AA00 (2 uppercase letters + 2 digits)
  nome: string;
  valor: number;
  estoque: number;
  rfid: string;
  pendente: number; // 0 or 1
  ativo: number; // 0 or 1
}

export interface PendingItem {
  id: string;
  rfid: string;
}

export interface HistoryRecord {
  id: number;
  item_id: string;
  nome: string;
  tipo: string; // "add" or "sub"
  quantidade: number;
  data: string; // ISO timestamp
}

// Request payloads

export interface EditItemPayload {
  nome: string;
  valor: number;
  ativo: number; // 0 or 1
  pendente: number; // always 1 when editing from frontend
}

export interface StockPayload {
  tipo: 'add' | 'sub';
  quantidade: number; // integer > 0
}

// API error response

export interface ApiError {
  erro: string;
}

// Filter state types

export interface ItensCadastradosFilters {
  id: string;
  nome: string;
  ativo: string; // "todos" | "sim" | "nao"
  [key: string]: string;
}

export interface ItensPendentesFilters {
  id: string;
  [key: string]: string;
}

export interface HistoricoFilters {
  item_id: string;
  nome: string;
  tipo: string; // "todos" | "add" | "sub"
  [key: string]: string;
}
