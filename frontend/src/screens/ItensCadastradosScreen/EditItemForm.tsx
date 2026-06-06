import { useState } from 'react';
import { updateItem } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Item } from '../../types';
import '../../components/Modal/EditForm.css';

interface EditItemFormProps {
  item: Item;
  onSave: () => void;
  onCancel: () => void;
}

function EditItemForm({ item, onSave, onCancel }: EditItemFormProps) {
  const [nome, setNome] = useState(item.nome);
  const [valor, setValor] = useState<string>(String(item.valor));
  const [ativo, setAtivo] = useState<number>(item.ativo);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string; valor?: string }>({});
  const { showToast } = useToast();

  function validate(): boolean {
    const newErrors: { nome?: string; valor?: string } = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!valor.trim() || isNaN(Number(valor))) {
      newErrors.valor = 'Valor é obrigatório';
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
        valor: Number(valor),
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
        <label htmlFor="edit-nome">Nome</label>
        <input
          id="edit-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          aria-label="Nome do item"
          aria-invalid={!!errors.nome}
        />
        {errors.nome && <span className="edit-item-form__error">{errors.nome}</span>}
      </div>

      <div className="edit-item-form__field">
        <label htmlFor="edit-valor">Valor</label>
        <input
          id="edit-valor"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          aria-label="Valor do item"
          aria-invalid={!!errors.valor}
          min="0"
          step="any"
        />
        {errors.valor && <span className="edit-item-form__error">{errors.valor}</span>}
      </div>

      <div className="edit-item-form__field">
        <label htmlFor="edit-ativo">Ativo</label>
        <div className="edit-item-form__toggle">
          <button
            id="edit-ativo"
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

export default EditItemForm;
