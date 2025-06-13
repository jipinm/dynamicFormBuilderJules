import React, { useEffect } from 'react';
import { useSchema } from '../../contexts/SchemaContext';
import DynamicSection from './DynamicSection';
import { FormStateProvider, useFormState } from '../../contexts/FormStateContext';
import { ProcessedSchema, FieldDefinition } from '../../types/schema';

const FormRendererInternal: React.FC = () => {
  const { processedSchema, isLoading, error, getFieldDefinition } = useSchema();
  const { initializeForm, formState, formErrors, validateAllFields } = useFormState();

  useEffect(() => {
    if (processedSchema) {
      const initialValues: { [path: string]: any } = {};
      // Logic to extract defaultValues (as before)
      processedSchema.formTemplate.sections.forEach(sectionLink => {
        const section = processedSchema.sectionTemplates[sectionLink.sectionId];
        if (section) {
          section.individualFields.forEach(fieldId => {
            const fd = getFieldDefinition(fieldId);
            if (fd && fd.defaultValue !== undefined && fd.defaultValue !== null) {
              initialValues[\`\${section.id}.\${fieldId}\`] = fd.defaultValue;
            }
          });
          section.fieldGroups.forEach(groupId => {
            const group = processedSchema.fieldGroupTemplates[groupId];
            if (group) {
              group.fields.forEach(fieldId => {
                const fd = getFieldDefinition(fieldId);
                if (fd && fd.defaultValue !== undefined && fd.defaultValue !== null) {
                  const fieldPath = group.repeatable
                                  ? \`\${section.id}.\${group.id}[0].\${fieldId}\`
                                  : \`\${section.id}.\${group.id}.\${fieldId}\`;
                  initialValues[fieldPath] = fd.defaultValue;
                }
              });
            }
          });
        }
      });
      initializeForm(initialValues);
    }
  }, [processedSchema, initializeForm, getFieldDefinition]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (processedSchema && validateAllFields(processedSchema)) {
      console.log("Form Submitted Successfully", formState);
      alert("Form submitted successfully! Check console.");
    } else {
      console.log("Form Submission Failed - Validation Errors", formErrors);
      alert("Form has validation errors. Please check the fields.");
    }
  };

  if (isLoading) return <div>Loading schema...</div>;
  if (error) return <div>Error loading schema: {error.message}</div>;
  if (!processedSchema || !processedSchema.formTemplate) return <div>No schema loaded or form template missing.</div>;

  const { formTemplate } = processedSchema;

  return (
    <div className="schema-form-renderer">
      <h1>{formTemplate.name}</h1>
      <p>{formTemplate.description}</p>
      <form onSubmit={handleSubmit}>
        {formTemplate.sections.map((sectionLink) => (
          <DynamicSection
            key={sectionLink.sectionId}
            sectionId={sectionLink.sectionId}
          />
        ))}
        <button type="submit" style={{ marginTop: '20px', padding: '10px 15px', fontSize: '1em' }}>Submit Form</button>
      </form>
      <div style={{marginTop: '20px', padding: '10px', border: '1px solid lightgray', backgroundColor: '#f0f0f0'}}>
        <h4>Current Form Values (Live):</h4>
        <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{JSON.stringify(formState, null, 2)}</pre>
        <h4>Current Form Errors (Live):</h4>
        <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{JSON.stringify(formErrors, null, 2)}</pre>
      </div>
    </div>
  );
}

const SchemaFormRenderer: React.FC = () => {
  return (
    <FormStateProvider>
      <FormRendererInternal />
    </FormStateProvider>
  );
};

export default SchemaFormRenderer;
