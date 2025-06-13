import React from 'react';
import { useSchema } from '../../contexts/SchemaContext';
import { useFormState } from '../../contexts/FormStateContext';
import DynamicField from './DynamicField';
import { isElementVisible } from '../../utils/ruleEvaluator';

interface DynamicFieldGroupProps {
  fieldGroupId: string;
  parentPath: string;
}

const DynamicFieldGroup: React.FC<DynamicFieldGroupProps> = ({ fieldGroupId, parentPath }) => {
  const { getFieldGroupTemplate, processedSchema } = useSchema();
  const { formState } = useFormState();

  if (!processedSchema) {
    return <div>Schema not processed for FieldGroup.</div>;
  }

  const fieldGroupTemplate = getFieldGroupTemplate(fieldGroupId);

  if (!fieldGroupTemplate) {
    return <div style={{color: 'red'}}>Field group template not found for ID: {fieldGroupId} (parent: {parentPath})</div>;
  }

  const groupPath = `${parentPath}.${fieldGroupId}`; // Base path for fields within this group
  const visible = isElementVisible(fieldGroupTemplate.displayRules, formState, processedSchema.fieldDefinitions, groupPath);

  if (!visible) {
    return null;
  }

  // TODO: Implement repeatable logic for field groups
  // For now, assumes not repeatable or only first instance for path construction

  return (
    <div className="dynamic-field-group" id={fieldGroupTemplate.id} style={{ border: '1px solid #666', margin: '10px', padding: '10px', backgroundColor: '#f9f9f9' }}>
      <h4>{fieldGroupTemplate.name}</h4>
      <p>{fieldGroupTemplate.description}</p>

      {fieldGroupTemplate.fields.map(fieldId => (
        <DynamicField
          key={fieldId}
          fieldId={fieldId}
          // Path for non-repeatable: sectionId.groupId.fieldId
          // Path for repeatable: sectionId.groupId[index].fieldId - requires state for index
          path={fieldGroupTemplate.repeatable ? `${groupPath}[0].${fieldId}` : `${groupPath}.${fieldId}`}
        />
      ))}

      {fieldGroupTemplate.repeatable && (
        <button type="button" onClick={() => alert('Add instance - Not implemented yet for FieldGroup '\${fieldGroupTemplate.name}\`)}>
          Add {fieldGroupTemplate.name}
        </button>
      )}
    </div>
  );
};

export default DynamicFieldGroup;
