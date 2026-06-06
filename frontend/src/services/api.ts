import type {
  Item,
  PendingItem,
  HistoryRecord,
  EditItemPayload,
  StockPayload,
} from '../types';

const BASE_URL = 'http://127.0.0.1:5000';
const TIMEOUT_MS = 15000;

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiRequestError(body.erro || `Erro ${response.status}`);
    }

    const data = await response.json().catch(() => {
      throw new ApiRequestError('Resposta inválida do servidor');
    });

    return data as T;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof ApiRequestError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiRequestError('Requisição expirou. Tente novamente.');
    }
    throw new ApiRequestError('Erro de conexão com o servidor');
  }
}

export function fetchItens(): Promise<Item[]> {
  return request<Item[]>('/itens');
}

export function fetchPendentes(): Promise<PendingItem[]> {
  return request<PendingItem[]>('/pendentes');
}

export function fetchHistorico(itemRef?: string): Promise<HistoryRecord[]> {
  const path = itemRef ? `/historico/${itemRef}` : '/historico';
  return request<HistoryRecord[]>(path);
}

export function updateItem(itemRef: string, payload: EditItemPayload): Promise<void> {
  return request<void>(`/item/${itemRef}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateEstoque(itemRef: string, payload: StockPayload): Promise<void> {
  return request<void>(`/estoque/${itemRef}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
