import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {error && <span className="form-error-msg">{error}</span>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`form-input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, placeholder, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`form-select ${error ? 'select-error' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

interface MultiSelectPillProps<T> {
  options: { value: string | number; label: string; data?: T }[];
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
}

export function MultiSelectPill<T>({ options, selectedValues, onChange }: MultiSelectPillProps<T>) {
  const handleToggle = (value: string | number) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="pills-selector-grid">
      {options.map((opt) => {
        const isChecked = selectedValues.includes(opt.value);
        const inputId = `pill-checkbox-${opt.value}`;
        return (
          <div key={opt.value}>
            <input
              type="checkbox"
              id={inputId}
              className="pill-checkbox-input"
              checked={isChecked}
              onChange={() => handleToggle(opt.value)}
            />
            <label htmlFor={inputId} className="pill-checkbox-label">
              {opt.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}
