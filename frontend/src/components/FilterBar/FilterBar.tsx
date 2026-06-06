import './FilterBar.css';

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function FilterBar({ fields, values, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filtros">
      {fields.map((field) => (
        <div className="filter-bar__field" key={field.key}>
          <label className="filter-bar__label" htmlFor={`filter-${field.key}`}>
            {field.label}
          </label>
          {field.type === 'text' ? (
            <input
              id={`filter-${field.key}`}
              className="filter-bar__input"
              type="text"
              value={values[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.label}
            />
          ) : (
            <select
              id={`filter-${field.key}`}
              className="filter-bar__select"
              value={values[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
