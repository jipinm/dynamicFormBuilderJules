import React from 'react';
import { BaseFieldProps } from './commonFieldTypes';

interface NumberInputProps extends BaseFieldProps {
  // NumberInput specific props
}

const NumberInput: React.FC<NumberInputProps> = ({ fieldDefinition, path, value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = fieldDefinition.dataType === 'integer'
                ? parseInt(event.target.value, 10)
                : parseFloat(event.target.value);
    // Handle cases where parsing results in NaN (e.g., empty input or invalid chars)
    onChange(path, isNaN(val) ? '' : val);
  };

  return (
    <div className="form-field form-field-number">
      <input
        type="number"
        id={path}
        name={path}
        value={value === undefined || value === null || value === '' ? '' : String(value)} // Ensure value is string for input
        onChange={handleChange}
        placeholder={fieldDefinition.placeholder || ''}
        required={fieldDefinition.required}
        step={fieldDefinition.dataType === 'decimal' ? 'any' : '1'}
        className="form-input form-input-number"
      />
    </div>
  );
};

export default NumberInput;
