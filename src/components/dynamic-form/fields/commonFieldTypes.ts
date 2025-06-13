import { FieldDefinition } from '../../../types/schema';

export interface BaseFieldProps {
  fieldDefinition: FieldDefinition;
  path: string;
  value: any; // Will be properly typed by form state later
  onChange: (path: string, value: any) => void;
  // Add any other common props like onBlur, error messages, etc.
}
