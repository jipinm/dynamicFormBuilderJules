import React from 'react';
import { BaseFieldProps } from './commonFieldTypes';

interface DateInputProps extends BaseFieldProps {
  // DateInput specific props
}

const DateInput: React.FC<DateInputProps> = ({ fieldDefinition, path, value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(path, event.target.value); // Date value is typically YYYY-MM-DD string
  };

  return (
    <div className="form-field form-field-date">
      <input
        type="date"
        id={path}
        name={path}
        value={value || ''} // Expects YYYY-MM-DD
        onChange={handleChange}
        placeholder={fieldDefinition.placeholder || ''}
        required={fieldDefinition.required}
        className="form-input form-input-date"
      />
    </div>
  );
};

export default DateInput;
