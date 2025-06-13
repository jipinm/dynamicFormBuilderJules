import React from 'react';
import { BaseFieldProps } from './commonFieldTypes';

interface SelectInputProps extends BaseFieldProps {
  // SelectInput specific props
}

const SelectInput: React.FC<SelectInputProps> = ({ fieldDefinition, path, value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(path, event.target.value);
  };

  return (
    <div className="form-field form-field-select">
      <select
        id={path}
        name={path}
        value={value || ''}
        onChange={handleChange}
        required={fieldDefinition.required}
        className="form-input form-select"
      >
        {fieldDefinition.placeholder && <option value="">{fieldDefinition.placeholder}</option>}
        {fieldDefinition.options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
