import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import BackArrow from '../../components/BackArrow/BackArrow';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import DataTable from '../../components/DataTable/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { fetchHistorico } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { filterHistorico } from '../../utils/filters';
import type { HistoryRecord, HistoricoFilters } from '../../types';
import './HistoricoScreen.css';

const filterFields = [
  { key: 'item_id', label: 'ID do item', type: 'text' as const },
  { key: 'nome', label: 'Nome do item', type: 'text' as const },
  {
    key: 'tipo',
    label: 'Tipo de movimentação',
    type: 'select' as const,
    options: [
      { value: 'todos', label: 'Todos' },
      { value: 'add', label: 'Adição' },
      { value: 'sub', label: 'Subtração' },
    ],
  },
];

function HistoricoScreen() {
  const { item_ref } = useParams<{ item_ref?: string }>();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HistoricoFilters>({
    item_id: '',
    nome: '',
    tipo: 'todos',
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadHistorico();
  }, [item_ref]);

  async function loadHistorico() {
    setLoading(true);
    try {
      const data = await fetchHistorico(item_ref);
      setRecords(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar histórico';
      showToast(message, 'error');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filteredRecords = useMemo(() => {
    return filterHistorico(records, filters);
  }, [records, filters]);

  const columns = [
    { key: 'id', header: 'ID da movimentação' },
    { key: 'item_id', header: 'ID do item' },
    { key: 'nome', header: 'Nome do Item' },
    {
      key: 'tipo',
      header: 'Tipo de movimentação',
      render: (record: HistoryRecord) =>
        record.tipo === 'add' ? 'Adição' : 'Subtração',
    },
    { key: 'quantidade', header: 'Quantidade' },
    { key: 'data', header: 'Data' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="historico">
      <div className="historico__header">
        <BackArrow to="/" label="Voltar para Home" />
        <h1 className="historico__title">Histórico de Movimentações</h1>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
      />

      <DataTable
        columns={columns}
        data={filteredRecords}
        emptyMessage="Nenhum registro de movimentação encontrado"
      />
    </div>
  );
}

export default HistoricoScreen;
