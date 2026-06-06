import { useState, useEffect, useMemo } from 'react';
import BackArrow from '../../components/BackArrow/BackArrow';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import DataTable from '../../components/DataTable/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Modal } from '../../components/Modal/Modal';
import EditPendingItemForm from './EditPendingItemForm';
import { fetchPendentes } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { filterItensPendentes } from '../../utils/filters';
import type { PendingItem, ItensPendentesFilters } from '../../types';
import './ItensPendentesScreen.css';

const filterFields = [
  { key: 'id', label: 'ID', type: 'text' as const },
];

function ItensPendentesScreen() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ItensPendentesFilters>({ id: '' });
  const [editingItem, setEditingItem] = useState<PendingItem | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadPendentes();
  }, []);

  async function loadPendentes() {
    setLoading(true);
    try {
      const data = await fetchPendentes();
      setItems(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar itens pendentes';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleEditSave() {
    setEditingItem(null);
    loadPendentes();
    showToast('Item Editado com sucesso', 'success');
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filteredItems = useMemo(() => {
    return filterItensPendentes(items, filters);
  }, [items, filters]);

  const columns = [
    { key: 'id', header: 'Id' },
    { key: 'rfid', header: 'RFID' },
    {
      key: 'editar',
      header: 'Editar',
      render: (item: PendingItem) => (
        <button
          className="itens-pendentes__edit-btn"
          type="button"
          aria-label={`Editar item ${item.id}`}
          onClick={() => setEditingItem(item)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="itens-pendentes">
      <div className="itens-pendentes__header">
        <BackArrow to="/" label="Voltar para Home" />
        <h1 className="itens-pendentes__title">Itens Pendentes de Cadastro</h1>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
      />

      <DataTable
        columns={columns}
        data={filteredItems}
        emptyMessage="Nenhum item pendente encontrado"
      />

      <Modal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Cadastrar Item"
      >
        {editingItem && (
          <EditPendingItemForm
            item={editingItem}
            onSave={handleEditSave}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default ItensPendentesScreen;
