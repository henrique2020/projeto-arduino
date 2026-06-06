import './DataTable.css';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage: string;
}

function DataTable<T>({ columns, data, emptyMessage }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="data-table__empty" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="data-table__wrapper">
      <table className="data-table">
        <thead className="data-table__head">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="data-table__header-cell">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="data-table__body">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="data-table__row">
              {columns.map((column) => (
                <td key={column.key} className="data-table__cell">
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
