// src/types/schema.ts

export interface Option {
  value: string | number;
  label: string;
}

export interface CodedValue {
  system: string;
  code: string | null;
  display: string | null;
}

export interface ValidationRule {
  id: string;
  type: string; // e.g., 'range', 'required', 'pattern', 'cross_field'
  min?: number;
  max?: number;
  pattern?: string;
  message: string;
  severity: 'error' | 'warning';
  condition?: string; // For cross_field or conditional validations
}

export interface Condition {
  field?: string; // Field ID for field-level conditions
  studyEvent?: string; // For section/form level conditions
  operator: 'equals' | 'notEquals' | '>=' | '<=' | '>' | '<' | 'exists';
  value: string | number | boolean | null;
  patientAge?: { // Specific condition for FormTemplate
    operator: '>=' | '<=' | '>' | '<';
    value: number;
  };
}

export interface DisplayRule {
  condition: Condition;
  visible: boolean;
}

export interface CalculationRule {
  id: string;
  targetField: string;
  formula: string; // This would ideally be parsed and executed
  dependencies: string[];
}

export interface DataSource {
  allowedSources: Array<'manual' | 'ehr' | 'lab_interface' | 'patient_app'>;
  deviceIntegration?: {
    deviceTypes: string[];
    mappingField: string;
  } | null;
}

export interface AuditMetadata {
  createdBy: string;
  createdAt: string; // ISO DateTime string
  version: string;
  changeLog: Array<{
    userId: string;
    timestamp: string;
    changes: string;
  }>;
}

export interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  description: string;
  dataType: 'string' | 'integer' | 'decimal' | 'select' | 'date' | 'boolean' | 'textarea'; // Added boolean and textarea
  unit?: string | null;
  precision?: number | null;
  required: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  defaultValue?: string | number | boolean | null;
  options?: Option[] | null;
  codedValue?: CodedValue | null;
  validationRules?: ValidationRule[] | null;
  calculationRules?: CalculationRule[] | null;
  displayRules?: DisplayRule[] | null;
  dataSource?: DataSource | null;
  auditMetadata?: AuditMetadata | null;
}

export interface FieldGroupTemplate {
  id: string;
  name: string;
  description: string;
  repeatable: boolean;
  maxInstances?: number;
  minInstances?: number;
  fields: string[]; // Array of FieldDefinition IDs
  displayRules?: DisplayRule[] | null;
  validationRules?: ValidationRule[] | null; // Group-level validation (cross-field within group)
  calculationRules?: CalculationRule[] | null;
}

export interface SectionCompletionRules {
  requiredFieldGroups?: string[]; // IDs of FieldGroupTemplates
  requiredFields?: string[]; // IDs of FieldDefinitions
  validationLevel: 'error' | 'warning';
}

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  collapsible: boolean;
  defaultExpanded: boolean;
  fieldGroups: string[]; // Array of FieldGroupTemplate IDs
  individualFields: string[]; // Array of FieldDefinition IDs
  displayRules?: DisplayRule[] | null;
  completionRules?: SectionCompletionRules | null;
}

export interface FormSectionLink {
  sectionId: string;
  displayOrder: number;
  required: boolean;
}

export interface FormCompletionRules {
  requiredSections: string[]; // IDs of SectionTemplates
  allowPartialSave: boolean;
  autoSaveInterval?: number; // in seconds
}

export interface SkipLogic {
  condition: Condition;
  skipSection: string; // ID of SectionTemplate to skip
}

export interface NavigationRules {
  allowBackNavigation: boolean;
  showProgressIndicator: boolean;
  skipLogic?: SkipLogic[] | null;
}

export interface AttachmentsConfig {
  allowedTypes: Array<'image' | 'document' | 'audio'>;
  maxFileSize: string; // e.g., "5MB"
  maxTotalSize: string; // e.g., "20MB"
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  estimatedDuration: number; // in minutes
  sections: FormSectionLink[];
  displayRules?: DisplayRule[] | null;
  completionRules?: FormCompletionRules | null;
  navigationRules?: NavigationRules | null;
  attachments?: AttachmentsConfig | null;
}

// Main Schema Interface
// This assumes that each JSON file contains one of each top-level key,
// but the actual form is primarily driven by FormTemplate, which then references
// SectionTemplates, which reference FieldGroupTemplates and FieldDefinitions.
// For parsing, we'll likely need to create maps of these definitions.
export interface FormSchema {
  schemaVersion: string;
  description: string;
  note?: string;

  // These are representative definitions. The actual instances will be linked by ID.
  // It might be more accurate to say a schema file *contains* these definitions,
  // and the application will build lookup tables from them.
  FieldDefinition: FieldDefinition; // This was singular in example, implies a library of possible fields
  FieldGroupTemplate: FieldGroupTemplate; // Same as above
  SectionTemplate: SectionTemplate; // Same as above
  FormTemplate: FormTemplate; // This is the entry point for a specific form

  // It's more likely the schemas are structured like this:
  // FormTemplate: FormTemplate;
  // SectionTemplates: { [id: string]: SectionTemplate };
  // FieldGroupTemplates: { [id: string]: FieldGroupTemplate };
  // FieldDefinitions: { [id: string]: FieldDefinition };
  // This will be clarified during the schema loading/parsing step.
  // For now, sticking to the observed structure in files.
}

// A more practical structure for the loaded and processed schema context
export interface ProcessedSchema {
  formTemplate: FormTemplate;
  sectionTemplates: Record<string, SectionTemplate>;
  fieldGroupTemplates: Record<string, FieldGroupTemplate>;
  fieldDefinitions: Record<string, FieldDefinition>;
  schemaVersion: string;
  description: string;
  note?: string;
}
