import React, { useEffect, useMemo, useRef, useState } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const ActionButton: React.FC<ActionButtonProps> = ({ variant = "primary", className = "", ...props }) => {
  return <button className={`ds-button ds-button--${variant} ${className}`.trim()} {...props} />;
};

export const SurfaceCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => {
  return <div className={`ds-surface ${className}`.trim()} {...props} />;
};

export const PageHero: React.FC<{ title: string; description: string; aside?: React.ReactNode }> = ({ title, description, aside }) => {
  return (
    <SurfaceCard className="ds-page-hero">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {aside ? <div className="ds-page-hero__aside">{aside}</div> : null}
    </SurfaceCard>
  );
};

export const PageToolbar: React.FC<{
  title: string;
  onNew?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hasSelection?: boolean;
  extraActions?: React.ReactNode;
}> = ({ title, onNew, onEdit, onDelete, hasSelection = false, extraActions }) => {
  return (
    <div className="ds-page-toolbar">
      <div>
        <h1>{title}</h1>
      </div>
      <div className="ds-page-toolbar__actions">
        {extraActions}
        {onNew ? <ActionButton type="button" onClick={onNew}>Novo</ActionButton> : null}
        {onEdit ? <ActionButton type="button" variant="secondary" disabled={!hasSelection} onClick={onEdit}>Alterar</ActionButton> : null}
        {onDelete && hasSelection ? <ActionButton type="button" variant="danger" onClick={onDelete}>Excluir</ActionButton> : null}
      </div>
    </div>
  );
};

export const Field: React.FC<{
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, hint, error, required, children }) => {
  return (
    <div className="ds-field">
      <span className="ds-field__label">
        {label}
        {required ? <em>*</em> : null}
      </span>
      {children}
      {error ? <span className="ds-field__error">{error}</span> : null}
      {!error && hint ? <span className="ds-field__hint">{hint}</span> : null}
    </div>
  );
};

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => <input ref={ref} className={`ds-input ${className}`.trim()} {...props} />
);
TextInput.displayName = "TextInput";

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => <textarea ref={ref} className={`ds-input ds-textarea ${className}`.trim()} {...props} />
);
TextArea.displayName = "TextArea";

type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

type SelectInputProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children: React.ReactNode;
};

export const SelectInput = React.forwardRef<HTMLButtonElement, SelectInputProps>(
  ({ className = "", children, value, onChange, disabled, placeholder, name, required, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const options = useMemo<SelectOption[]>(
      () =>
        React.Children.toArray(children)
          .reduce<SelectOption[]>((accumulator, child) => {
            if (!React.isValidElement(child)) return accumulator;
            const optionProps = child.props as {
              value?: string | number;
              children?: React.ReactNode;
              disabled?: boolean;
            };

            accumulator.push({
              value: String(optionProps.value ?? ""),
              label: optionProps.children,
              disabled: optionProps.disabled,
            });

            return accumulator;
          }, []),
      [children]
    );

    const stringValue = String(value ?? "");
    const selectedOption = options.find((option) => option.value === stringValue);
    const displayLabel = selectedOption?.label ?? placeholder ?? options.find((option) => option.value === "")?.label ?? "Selecionar";
    const filteredOptions = useMemo(() => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return options;

      return options.filter((option) =>
        String(option.label ?? "")
          .toLowerCase()
          .includes(normalized)
      );
    }, [options, query]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (!wrapperRef.current?.contains(event.target as Node)) {
          setOpen(false);
          setQuery("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const emitChange = (nextValue: string) => {
      onChange?.({
        target: { value: nextValue, name },
        currentTarget: { value: nextValue, name },
      } as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
      setQuery("");
    };

    return (
      <div ref={wrapperRef} className={`ds-select ${className}`.trim()}>
        <input type="hidden" name={name} value={stringValue} required={required} />
        <button
          {...(props as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">)}
          ref={ref}
          type="button"
          className={`ds-select__trigger ${open ? "is-open" : ""}`}
          onClick={() => {
            if (disabled) return;
            setOpen((current) => {
              const next = !current;
              if (!next) setQuery("");
              return next;
            });
          }}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={`ds-select__value ${!selectedOption ? "is-placeholder" : ""}`}>{displayLabel}</span>
          <span className="ds-select__icon">{open ? "˄" : "˅"}</span>
        </button>
        {open ? (
          <div className="ds-select-menu" role="listbox">
            <div className="ds-select-menu__search">
              <TextInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar opcao"
                autoFocus
              />
            </div>
            {filteredOptions.map((option) => (
              <button
                key={`${option.value}-${String(option.label)}`}
                type="button"
                className={`ds-select-menu__item ${option.value === stringValue ? "is-selected" : ""}`}
                onClick={() => !option.disabled && emitChange(option.value)}
                disabled={option.disabled}
              >
                <span>{option.label}</span>
                {option.value === stringValue ? <span className="ds-select-menu__check">•</span> : null}
              </button>
            ))}
            {!filteredOptions.length ? <div className="ds-select-menu__empty">Nenhuma opcao encontrada.</div> : null}
          </div>
        ) : null}
      </div>
    );
  }
);
SelectInput.displayName = "SelectInput";

export const ToggleCard: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
}> = ({ checked, onChange, title, description }) => {
  return (
    <button type="button" className={`ds-toggle-card ${checked ? "is-active" : ""}`} onClick={() => onChange(!checked)}>
      <span className="ds-toggle-card__indicator" />
      <span>
        <strong>{title}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </button>
  );
};

export const TagList: React.FC<{ values: string[] }> = ({ values }) => {
  if (!values.length) return <span className="ds-empty-inline">Nenhum item</span>;
  return (
    <div className="ds-tag-list">
      {values.map((value) => (
        <span className="ds-tag" key={value}>{value}</span>
      ))}
    </div>
  );
};

export const MultiSelectChips: React.FC<{
  options: { value: string; label: string; description?: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}> = ({ options, values, onChange }) => {
  return (
    <div className="ds-choice-grid">
      {options.map((option) => {
        const checked = values.includes(option.value);
        return (
          <ToggleCard
            key={option.value}
            checked={checked}
            onChange={(next) => onChange(next ? [...values, option.value] : values.filter((value) => value !== option.value))}
            title={option.label}
            description={option.description}
          />
        );
      })}
    </div>
  );
};

export const SearchBar: React.FC<{ value: string; onChange: (value: string) => void; placeholder?: string }> = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="ds-searchbar">
      <span>Buscar</span>
      <TextInput value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
};

const SelectionControl: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}> = ({ checked, onChange, ariaLabel }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={checked}
      className={`ds-selection-control ${checked ? "is-selected" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="ds-selection-control__mark" />
    </button>
  );
};

type TableColumn<T> = {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
  searchValue?: (row: T) => string;
  sortValue?: (row: T) => string | number;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  selectedIds,
  onSelectionChange,
  onRowClick,
  searchPlaceholder,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    if (!query.trim()) return rows;
    const normalized = query.toLowerCase();
    return rows.filter((row) =>
      columns.some((column) => {
        const raw = column.searchValue ? column.searchValue(row) : String(column.render(row) ?? "");
        return raw.toLowerCase().includes(normalized);
      })
    );
  }, [columns, query, rows]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const column = columns.find((item) => item.key === sortKey);
    if (!column) return filteredRows;

    return [...filteredRows].sort((left, right) => {
      const leftValue = column.sortValue ? column.sortValue(left) : column.searchValue ? column.searchValue(left) : String(column.render(left) ?? "");
      const rightValue = column.sortValue ? column.sortValue(right) : column.searchValue ? column.searchValue(right) : String(column.render(right) ?? "");

      if (leftValue < rightValue) return sortDirection === "asc" ? -1 : 1;
      if (leftValue > rightValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [columns, filteredRows, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [page, sortedRows]);

  const allVisibleSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedIds.includes(row.id));

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
      return;
    }
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  };

  return (
    <SurfaceCard className="ds-table-shell">
      <div className="ds-table-shell__toolbar">
        <SearchBar value={query} onChange={setQuery} placeholder={searchPlaceholder} />
        <span className="ds-table-shell__count">{sortedRows.length} registros</span>
      </div>
      <div className="ds-table-scroll">
        <table className="ds-table">
          <thead>
            <tr>
              <th className="ds-table__checkbox-cell">
                <SelectionControl
                  checked={allVisibleSelected}
                  ariaLabel="Selecionar linhas visiveis"
                  onChange={(checked) =>
                    onSelectionChange(
                      checked
                        ? Array.from(new Set([...selectedIds, ...filteredRows.map((row) => row.id)]))
                        : selectedIds.filter((id) => !filteredRows.some((row) => row.id === id))
                    )
                  }
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => toggleSort(column.key)}
                  className="ds-table__sortable"
                >
                  <span>{column.header}</span>
                  <span className="ds-table__sort-indicator">
                    {sortKey === column.key ? (sortDirection === "asc" ? "^" : "v") : ""}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <tr key={row.id} className={isSelected ? "is-selected" : ""} onClick={() => onRowClick?.(row)}>
                  <td className="ds-table__checkbox-cell" onClick={(event) => event.stopPropagation()}>
                    <SelectionControl
                      checked={isSelected}
                      ariaLabel={`Selecionar linha ${row.id}`}
                      onChange={(checked) =>
                        onSelectionChange(
                          checked
                            ? [...selectedIds, row.id]
                            : selectedIds.filter((id) => id !== row.id)
                        )
                      }
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!sortedRows.length ? <div className="ds-empty-state">Nenhum registro encontrado.</div> : null}
      <div className="ds-table-shell__footer">
        <span className="ds-table-shell__count">
          Pagina {page} de {totalPages}
        </span>
        <div className="ds-pagination">
          <ActionButton type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Anterior
          </ActionButton>
          <ActionButton type="button" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            Proxima
          </ActionButton>
        </div>
      </div>
    </SurfaceCard>
  );
}

export const Modal: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  size?: "md" | "lg" | "xl";
  children: React.ReactNode;
}> = ({ open, title, description, onClose, actions, size = "lg", children }) => {
  if (!open) return null;

  return (
    <div className="ds-modal-backdrop" onClick={onClose}>
      <div className={`ds-modal ds-modal--${size}`} onClick={(event) => event.stopPropagation()}>
        <div className="ds-modal__header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <ActionButton variant="ghost" type="button" onClick={onClose}>Fechar</ActionButton>
        </div>
        <div className="ds-modal__body">{children}</div>
        {actions ? <div className="ds-modal__footer">{actions}</div> : null}
      </div>
    </div>
  );
};

export const InlineNotice: React.FC<{ tone?: "success" | "error" | "info"; children: React.ReactNode }> = ({ tone = "info", children }) => {
  return <div className={`ds-notice ds-notice--${tone}`}>{children}</div>;
};

export const StatGrid: React.FC<{ items: { label: string; value: React.ReactNode }[] }> = ({ items }) => {
  return (
    <div className="ds-stat-grid">
      {items.map((item) => (
        <SurfaceCard key={item.label} className="ds-stat-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </SurfaceCard>
      ))}
    </div>
  );
};
