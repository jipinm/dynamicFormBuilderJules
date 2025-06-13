import React from 'react';
import { BaseFieldProps } from './commonFieldTypes';

interface StringInputProps extends BaseFieldProps {
  // StringInput specific props, if any, can be added here
}

const StringInput: React.FC<StringInputProps> = ({ fieldDefinition, path, value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(path, event.target.value);
  };

  const inputType = fieldDefinition.dataType === 'textarea' ? 'textarea' : 'text';

  return (
    <div className="form-field form-field-string">
      {inputType === 'textarea' ? (
        <textarea
          id={path}
          name={path}
          value={value || ''}
          onChange={handleChange}
          placeholder={fieldDefinition.placeholder || ''}
          required={fieldDefinition.required}
          rows={5} // Default rows for textarea, could be configurable
          className="form-input form-textarea"
        />
      ) : (
        <input
          type={inputType}
          id={path}
          name={path}
          value={value || ''}
          onChange={handleChange}
          placeholder={fieldDefinition.placeholder || ''}
          required={fieldDefinition.required}
          className="form-input form-input-text"
        />
      )}
    </div>
  );
};

export default StringInput;
