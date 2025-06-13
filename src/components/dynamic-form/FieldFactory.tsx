import React from 'react';
import { FieldDefinition } from '../../types/schema';
import StringInput from './fields/StringInput';
import NumberInput from './fields/NumberInput';
import SelectInput from './fields/SelectInput';
import DateInput from './fields/DateInput';

interface FieldFactoryProps {
  fieldDefinition: FieldDefinition;
  path: string;
  value: any;
  onChange: (path: string, value: any) => void; // This now comes from FormStateContext via DynamicField
}

const FieldFactory: React.FC<FieldFactoryProps> = ({ fieldDefinition, path, value, onChange }) => {
  // onChange is now the actual updateFieldValue function from FormStateContext
  const commonProps = {
    fieldDefinition,
    path,
    value,
    onChange,
  };

  switch (fieldDefinition.dataType) {
    case 'string':
    case 'textarea':
      return <StringInput {...commonProps} />;
    case 'integer':
    case 'decimal':
      return <NumberInput {...commonProps} />;
    case 'select':
      return <SelectInput {...commonProps} />;
    case 'date':
      return <DateInput {...commonProps} />;
    default:
      return (
        <div style={{ color: 'orange', border: '1px solid orange', padding: '5px' }}>
          Unsupported field type: {fieldDefinition.dataType} for field "{fieldDefinition.name}" (Path: {path})
        </div>
      );
  }
};

export default FieldFactory;
