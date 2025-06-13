import React from 'react';
import { useSchema } from '../../contexts/SchemaContext';
import { useFormState } from '../../contexts/FormStateContext';
import FieldFactory from './FieldFactory';
import { isElementVisible } from '../../utils/ruleEvaluator';

interface DynamicFieldProps {
  fieldId: string;
  path: string;
}

const DynamicField: React.FC<DynamicFieldProps> = ({ fieldId, path }) => {
  const { getFieldDefinition, processedSchema } = useSchema();
  // updateFieldValue will now also trigger validation if fieldDefinition is passed
  const { formState, formErrors, updateFieldValue } = useFormState();

  if (!processedSchema) {
    return <div>Schema not processed for Field.</div>;
  }

  const fieldDefinition = getFieldDefinition(fieldId);

  if (!fieldDefinition) {
    return <div style={{color: 'red'}}>Field definition not found for ID: {fieldId} (Path: {path})</div>;
  }

  const visible = isElementVisible(fieldDefinition.displayRules, formState, processedSchema.fieldDefinitions, path);

  if (!visible) {
    return null;
  }

  const currentValue = formState[path] !== undefined ? formState[path] : fieldDefinition.defaultValue;
  const fieldErrors = formErrors[path] || [];

  // Wrap updateFieldValue to pass fieldDefinition for immediate validation
  const handleValueChange = (currentPath: string, newValue: any) => {
    updateFieldValue(currentPath, newValue, fieldDefinition);
  };

  return (
    <div className="dynamic-field" data-path={path} style={{margin: '10px 5px', padding: '10px 5px', border: fieldErrors.length > 0 ? '1px solid red' : '1px solid #ccc', backgroundColor: '#fff', borderRadius: '4px' }}>
      <label htmlFor={path} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em', color: '#333' }}>
        {fieldDefinition.label || fieldDefinition.name}
        {fieldDefinition.required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
      </label>

      <FieldFactory
        fieldDefinition={fieldDefinition}
        path={path}
        value={currentValue}
        onChange={handleValueChange} // Use the wrapped handler
      />

      {fieldDefinition.helpText && <small style={{ display: 'block', marginTop: '5px', color: '#555', fontSize: '0.8em' }}>{fieldDefinition.helpText}</small>}

      {fieldErrors.length > 0 && (
        <div className="field-errors" style={{ color: 'red', marginTop: '5px', fontSize: '0.8em' }}>
          {fieldErrors.map((errorMsg, index) => (
            <div key={index}>{errorMsg}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicField;
