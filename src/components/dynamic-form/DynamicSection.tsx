import React from 'react';
import { useSchema } from '../../contexts/SchemaContext';
import { useFormState } from '../../contexts/FormStateContext';
import DynamicFieldGroup from './DynamicFieldGroup';
import DynamicField from './DynamicField';
import { isElementVisible } from '../../utils/ruleEvaluator';

interface DynamicSectionProps {
  sectionId: string;
}

const DynamicSection: React.FC<DynamicSectionProps> = ({ sectionId }) => {
  const { getSectionTemplate, processedSchema } = useSchema();
  const { formState } = useFormState();

  if (!processedSchema) {
    return <div>Schema not processed for Section.</div>;
  }

  const sectionTemplate = getSectionTemplate(sectionId);

  if (!sectionTemplate) {
    const allDefs = processedSchema.sectionTemplates;
    if (allDefs && !allDefs[sectionId]) {
        console.warn(\`SectionTemplate for ID '\${sectionId}' not found in processedSchema.sectionTemplates. Available keys:\`, Object.keys(allDefs));
    }
    return <div style={{color: 'red'}}>Section template not found for ID: {sectionId}</div>;
  }

  const visible = isElementVisible(sectionTemplate.displayRules, formState, processedSchema.fieldDefinitions, sectionTemplate.id);

  if (!visible) {
    return null;
  }

  return (
    <section className="dynamic-section" id={sectionTemplate.id} style={{ border: '2px solid #333', margin: '15px 0', padding: '15px', backgroundColor: '#eee' }}>
      <h2>{sectionTemplate.name}</h2>
      <p>{sectionTemplate.description}</p>

      <div className="section-field-groups">
        {sectionTemplate.fieldGroups.map((groupId) => (
          <DynamicFieldGroup
            key={groupId}
            fieldGroupId={groupId}
            parentPath={sectionTemplate.id}
          />
        ))}
      </div>

      <div className="section-individual-fields">
        {sectionTemplate.individualFields.map((fieldId) => (
          <DynamicField
            key={fieldId}
            fieldId={fieldId}
            path={`${sectionTemplate.id}.${fieldId}`}
          />
        ))}
      </div>
    </section>
  );
};

export default DynamicSection;
