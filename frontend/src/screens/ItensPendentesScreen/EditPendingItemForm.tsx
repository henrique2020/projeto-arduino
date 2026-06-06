import { useState } from 'react';
import { updateItem } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { PendingItem } from '../../types';
import '../../components/Modal/EditForm.css';

interface EditPendingItemFormProps {
  item: PendingItem;
  onSave: () => void;
  onCancel: () => void;
}

function EditPendingItemForm({ item, onSave, onCancel }: EditPendingItemFormProps) {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState<string>('');
  const [ativo, setAtivo] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string }>({});
  const { showToast } = useToast();

  function validate(): boolean {
    const newErrors: { nome?: string } = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
      await updateItem(item.id, {
        pendente: 0,
        nome: nome.trim(),
        valor: Number(valor) || 0,
        ativo,
      });
      onSave();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao editar item';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="edit-item-form" onSubmit={handleSubmit} noValidate>
      <div className="edit-item-form__field">
        <label htmlFor="edit-pending-nome">Nome</label>
        <input
          id="edit-pending-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={100}
          aria-label="Nome do item"
          aria-invalid={!!errors.nome}
        />
        {errors.nome && <span className="edit-item-form__error">{errors.nome}</span>}
      </div>

      <div className="edit-item-form__field">
        <label htmlFor="edit-pending-valor">Valor</label>
        <input
          id="edit-pending-valor"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          aria-label="Valor do item"
          min="0"
          step="any"
        />
      </div>

      <div className="edit-item-form__field">
        <label htmlFor="edit-pending-ativo">Ativo</label>
        <div className="edit-item-form__toggle">
          <button
            id="edit-pending-ativo"
            type="button"
            role="switch"
            aria-checked={ativo === 1}
            aria-label="Item ativo"
            className={`edit-item-form__switch ${ativo === 1 ? 'edit-item-form__switch--active' : ''}`}
            onClick={() => setAtivo(ativo === 1 ? 0 : 1)}
          >
            <span className="edit-item-form__switch-thumb" />
          </button>
          <span className="edit-item-form__toggle-label">
            {ativo === 1 ? 'Sim' : 'Não'}
          </span>
        </div>
      </div>

      <div className="edit-item-form__actions">
        <button
          type="button"
          className="edit-item-form__btn edit-item-form__btn--cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="edit-item-form__btn edit-item-form__btn--save"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

export default EditPendingItemForm;
