import type {
  Item,
  PendingItem,
  HistoryRecord,
  ItensCadastradosFilters,
  ItensPendentesFilters,
  HistoricoFilters,
} from '../types';

/**
 * Filters registered items using AND logic across all active filters.
 * - ID: partial match (item.id contains filter string)
 * - Nome: partial case-insensitive match
 * - Ativo: exact match (sim=1, nao=0, todos=all)
 */
export function filterItensCadastrados(
  items: Item[],
  filters: ItensCadastradosFilters
): Item[] {
  return items.filter((item) => {
    // ID partial match
    if (filters.id && !item.id.includes(filters.id)) {
      return false;
    }
    // Nome partial case-insensitive match
    if (filters.nome && !item.nome.toLowerCase().includes(filters.nome.toLowerCase())) {
      return false;
    }
    // Ativo exact match
    if (filters.ativo === 'sim' && item.ativo !== 1) {
      return false;
    }
    if (filters.ativo === 'nao' && item.ativo !== 0) {
      return false;
    }
    return true;
  });
}

/**
 * Filters pending items by ID using partial case-insensitive match.
 */
export function filterItensPendentes(
  items: PendingItem[],
  filters: ItensPendentesFilters
): PendingItem[] {
  const idFilter = filters.id.toLowerCase();
  if (!idFilter) return items;
  return items.filter((item) => item.id.toLowerCase().includes(idFilter));
}

/**
 * Filters history records using AND logic across all active filters.
 * - item_id: partial case-insensitive match
 * - nome: partial case-insensitive match
 * - tipo: exact match (when not "todos")
 */
export function filterHistorico(
  records: HistoryRecord[],
  filters: HistoricoFilters
): HistoryRecord[] {
  return records.filter((record) => {
    // Partial case-insensitive match for item_id
    if (filters.item_id && !record.item_id.toLowerCase().includes(filters.item_id.toLowerCase())) {
      return false;
    }

    // Partial case-insensitive match for nome
    if (filters.nome && !record.nome.toLowerCase().includes(filters.nome.toLowerCase())) {
      return false;
    }

    // Exact match for tipo (when not "todos")
    if (filters.tipo && filters.tipo !== 'todos' && record.tipo !== filters.tipo) {
      return false;
    }

    return true;
  });
}
