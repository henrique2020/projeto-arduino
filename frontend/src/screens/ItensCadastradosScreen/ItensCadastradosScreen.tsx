import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BackArrow from '../../components/BackArrow/BackArrow';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import DataTable from '../../components/DataTable/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { Modal } from '../../components/Modal/Modal';
import EditItemForm from './EditItemForm';
import { StockForm } from './StockForm';
import { fetchItens } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { filterItensCadastrados } from '../../utils/filters';
import type { Item, ItensCadastradosFilters } from '../../types';
import './ItensCadastradosScreen.css';

const filterFields = [
  { key: 'id', label: 'ID', type: 'text' as const },
  { key: 'nome', label: 'Nome', type: 'text' as const },
  {
    key: 'ativo',
    label: 'Ativo',
    type: 'select' as const,
    options: [
      { value: 'todos', label: 'Todos' },
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
    ],
  },
];

function ItensCadastradosScreen() {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ItensCadastradosFilters>({
    id: '',
    nome: '',
    ativo: 'todos',
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [stockItem, setStockItem] = useState<Item | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchItens();
      setItens(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar itens';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleEditSave() {
    setEditingItem(null);
    loadData();
    showToast('Item Editado com sucesso', 'success');
  }

  function handleStockSave() {
    setStockItem(null);
    loadData();
    showToast('Item Editado com sucesso', 'success');
  }

  const filteredItens = useMemo(() => {
    return filterItensCadastrados(itens, filters);
  }, [itens, filters]);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nome', header: 'Nome' },
    {
      key: 'valor',
      header: 'Valor',
      render: (item: Item) => item.valor,
    },
    { key: 'estoque', header: 'Quantidade em Estoque' },
    {
      key: 'ativo',
      header: 'Ativo',
      render: (item: Item) => (item.ativo === 1 ? 'Sim' : 'Não'),
    },
    {
      key: 'editar',
      header: 'Editar',
      render: (item: Item) => (
        <button
          className="itens-cadastrados__action-btn"
          aria-label={`Editar item ${item.id}`}
          onClick={() => setEditingItem(item)}
          type="button"
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
    {
      key: 'estoque_action',
      header: 'Estoque',
      render: (item: Item) => (
        <button
          className="itens-cadastrados__action-btn"
          aria-label={`Gerenciar estoque item ${item.id}`}
          onClick={() => setStockItem(item)}
          type="button"
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
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
            <path d="M12 19V5" />
            <path d="M19 12l-7 7-7-7" />
          </svg>
        </button>
      ),
    },
    {
      key: 'historico',
      header: 'Histórico',
      render: (item: Item) => (
        <button
          className="itens-cadastrados__action-btn"
          aria-label={`Ver histórico item ${item.id}`}
          onClick={() => navigate(`/historico/${item.id}`)}
          type="button"
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
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
        </button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="itens-cadastrados">
      <div className="itens-cadastrados__header">
        <BackArrow to="/" label="Voltar para Home" />
        <h1 className="itens-cadastrados__title">Itens Cadastrados</h1>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
      />

      <DataTable
        columns={columns}
        data={filteredItens}
        emptyMessage="Nenhum item encontrado"
      />

      <Modal
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Editar Item"
      >
        {editingItem && (
          <EditItemForm
            item={editingItem}
            onSave={handleEditSave}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={stockItem !== null}
        onClose={() => setStockItem(null)}
        title="Gerenciar Estoque"
      >
        {stockItem && (
          <StockForm
            item={stockItem}
            onSave={handleStockSave}
            onCancel={() => setStockItem(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default ItensCadastradosScreen;
