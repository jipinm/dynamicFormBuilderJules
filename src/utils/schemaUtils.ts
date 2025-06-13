import { FormSchema, ProcessedSchema, FieldDefinition, SectionTemplate, FieldGroupTemplate } from '../types/schema';

/**
 * Fetches a JSON schema from the public/data directory.
 * @param schemaName The name of the schema file (without .json extension)
 * @returns Promise<FormSchema>
 */
export const fetchSchema = async (schemaName: string): Promise<FormSchema> => {
  const response = await fetch(`/data/\${schemaName}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch schema: \${schemaName} (\${response.status} \${response.statusText})`);
  }
  const schema = await response.json();
  // Basic validation: Check if it has a FormTemplate, which is key.
  if (!schema.FormTemplate || !schema.FormTemplate.id) {
    console.error('Fetched schema is missing or has an invalid FormTemplate:', schema);
    throw new Error(`Invalid schema format for: \${schemaName}. Missing FormTemplate or FormTemplate.id.`);
  }
  return schema as FormSchema;
};

/**
 * Processes the raw schema into a more usable format with lookup maps.
 * Assumes that the FieldDefinition, FieldGroupTemplate, and SectionTemplate
 * properties in the raw schema are single objects that should be used as the
 * sole definitions for their types within this specific schema file.
 * @param rawSchema The raw schema object fetched from JSON.
 * @returns ProcessedSchema
 */
export const processSchema = (rawSchema: FormSchema): ProcessedSchema => {
  const fieldDefinitions: Record<string, FieldDefinition> = {};
  if (rawSchema.FieldDefinition && rawSchema.FieldDefinition.id) {
    fieldDefinitions[rawSchema.FieldDefinition.id] = rawSchema.FieldDefinition;
  }
  // To support current structure where fields are referenced by ID,
  // we need to ensure all fields mentioned in groups and sections are added,
  // assuming the single FieldDefinition object is a template for all of them.
  // This part is tricky if IDs in groups/sections don't match the single FieldDefinition.id.
  // For now, this assumes the single FieldDefinition is THE definition for its ID.
  // A more robust solution would require schemas to provide a list/map of field definitions.
  // The current JSON structure (one FieldDefinition object) is a bit ambiguous for a generic renderer.
  // We will assume for now that any field ID mentioned in FieldGroupTemplate or SectionTemplate
  // refers to this single FieldDefinition object if its ID matches.
  // This is a limitation of the current schema structure if multiple, distinct fields are needed.

  const sectionTemplates: Record<string, SectionTemplate> = {};
  if (rawSchema.SectionTemplate && rawSchema.SectionTemplate.id) {
    sectionTemplates[rawSchema.SectionTemplate.id] = rawSchema.SectionTemplate;
  }
  // Similar logic for sections mentioned in FormTemplate.sections
  rawSchema.FormTemplate.sections.forEach(sectionLink => {
    if (!sectionTemplates[sectionLink.sectionId] && rawSchema.SectionTemplate && rawSchema.SectionTemplate.id === sectionLink.sectionId) {
       sectionTemplates[rawSchema.SectionTemplate.id] = rawSchema.SectionTemplate;
    } else if (!sectionTemplates[sectionLink.sectionId]) {
      // This case means a section is referenced in FormTemplate but no matching SectionTemplate object exists in the schema root.
      // This indicates a schema structural issue or a misunderstanding of how they are linked.
      // For now, we'll proceed, but this could lead to errors if a sectionId points to a non-existent definition.
      console.warn(`Section '\${sectionLink.sectionId}' is referenced in FormTemplate but no corresponding SectionTemplate object found in schema root.`)
    }
  });


  const fieldGroupTemplates: Record<string, FieldGroupTemplate> = {};
  if (rawSchema.FieldGroupTemplate && rawSchema.FieldGroupTemplate.id) {
    fieldGroupTemplates[rawSchema.FieldGroupTemplate.id] = rawSchema.FieldGroupTemplate;
  }
  // Similar logic for field groups mentioned in SectionTemplates
  Object.values(sectionTemplates).forEach(secTpl => {
    secTpl.fieldGroups.forEach(fgId => {
      if (!fieldGroupTemplates[fgId] && rawSchema.FieldGroupTemplate && rawSchema.FieldGroupTemplate.id === fgId) {
        fieldGroupTemplates[rawSchema.FieldGroupTemplate.id] = rawSchema.FieldGroupTemplate;
      } else if (!fieldGroupTemplates[fgId]){
        console.warn(`FieldGroup '\${fgId}' is referenced in SectionTemplate '\${secTpl.id}' but no corresponding FieldGroupTemplate object found in schema root.`)
      }
    });
  });

  // Now, ensure all field IDs mentioned in fieldGroups and individualFields (in sections)
  // are mapped to the single FieldDefinition if their IDs match.
  // This is a simplification. A real system would have a list of FieldDefinitions.
  const allFieldIds = new Set<string>();
  Object.values(fieldGroupTemplates).forEach(fgt => fgt.fields.forEach(fid => allFieldIds.add(fid)));
  Object.values(sectionTemplates).forEach(st => st.individualFields.forEach(fid => allFieldIds.add(fid)));

  allFieldIds.forEach(fieldId => {
    if (!fieldDefinitions[fieldId] && rawSchema.FieldDefinition && rawSchema.FieldDefinition.id === fieldId) {
      // This assumes if an ID matches the single FieldDefinition's ID, that's the one.
      fieldDefinitions[fieldId] = rawSchema.FieldDefinition;
    } else if (!fieldDefinitions[fieldId]) {
      // This is problematic: a field ID is used but doesn't match the single FieldDefinition.
      // This implies the schema expects multiple field definitions, but only provides one object.
      // For now, we'll create a placeholder or log an error.
      // A truly robust renderer would need the schema to provide a map/array of FieldDefinitions.
      console.warn(`Field ID '\${fieldId}' is used in the form structure, but no matching FieldDefinition was found or its ID does not match the provided single FieldDefinition object. The current schema structure might be insufficient for multiple distinct fields.`);
      // To avoid crashing, we could add a minimal placeholder, but this is a schema limitation.
      // fieldDefinitions[fieldId] = { id: fieldId, name: 'Unknown Field', label: 'Unknown Field', dataType: 'string', required: false };
    }
  });


  return {
    formTemplate: rawSchema.FormTemplate,
    sectionTemplates,
    fieldGroupTemplates,
    fieldDefinitions,
    schemaVersion: rawSchema.schemaVersion,
    description: rawSchema.description,
    note: rawSchema.note,
  };
};
