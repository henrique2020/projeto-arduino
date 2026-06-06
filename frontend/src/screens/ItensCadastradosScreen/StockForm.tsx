import { useState } from 'react';
import { updateEstoque } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Item } from '../../types';
import '../../components/Modal/EditForm.css';

interface StockFormProps {
  item: Item;
  onSave: () => void;
  onCancel: () => void;
}

export function StockForm({ item, onSave, onCancel }: StockFormProps) {
  const [tipo, setTipo] = useState<'add' | 'sub'>('add');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (quantidade < 1) {
      return;
    }

    setSaving(true);
    try {
      await updateEstoque(item.id, { tipo, quantidade: Number(quantidade) });
      onSave();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar estoque';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="edit-item-form" onSubmit={handleSubmit}>
      <div className="edit-item-form__field">
        <label htmlFor="stock-tipo">Tipo de movimentação</label>
        <select
          id="stock-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'add' | 'sub')}
          aria-label="Tipo de movimentação"
        >
          <option value="add">Adição</option>
          <option value="sub">Subtração</option>
        </select>
      </div>

      <div className="edit-item-form__field">
        <label htmlFor="stock-quantidade">Quantidade</label>
        <input
          id="stock-quantidade"
          type="number"
          min={1}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          aria-label="Quantidade"
        />
      </div>

      <div className="edit-item-form__actions">
        <button
          type="button"
          className="edit-item-form__btn edit-item-form__btn--cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="edit-item-form__btn edit-item-form__btn--save"
          disabled={saving || quantidade < 1}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
