import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { FieldDefinition, ProcessedSchema } from '../types/schema'; // Import FieldDefinition, ProcessedSchema
import { validateField } from '../utils/validationUtils'; // Import validateField

export interface FormState {
  [path: string]: any;
}

export interface FormErrors {
  [path: string]: string[];
}

interface FullFormState {
  values: FormState;
  errors: FormErrors;
}

type Action =
  | { type: 'UPDATE_FIELD_VALUE'; path: string; value: any; fieldDefinition?: FieldDefinition } // Pass FD for immediate validation
  | { type: 'SET_FIELD_ERRORS'; path: string; errors: string[] }
  | { type: 'CLEAR_FIELD_ERRORS'; path: string; }
  | { type: 'INITIALIZE_FORM'; initialValues: FormState }
  | { type: 'SET_FORM_ERRORS'; errors: FormErrors };

interface FormStateContextType {
  formState: FormState; // Keep this for easy access to values
  formErrors: FormErrors;
  updateFieldValue: (path: string, value: any, fieldDefinition?: FieldDefinition) => void;
  initializeForm: (initialState: FormState) => void;
  setFieldErrors: (path: string, errors: string[]) => void;
  clearFieldErrors: (path: string) => void;
  validateAllFields: (processedSchema: ProcessedSchema) => boolean; // Use ProcessedSchema type
}

const FormStateContext = createContext<FormStateContextType | undefined>(undefined);

const initialState: FullFormState = {
  values: {},
  errors: {},
};

const formStateReducer = (state: FullFormState, action: Action): FullFormState => {
  switch (action.type) {
    case 'INITIALIZE_FORM':
      return { ...initialState, values: action.initialValues, errors: {} }; // Clear errors on init
    case 'UPDATE_FIELD_VALUE':
      const newValues = {
        ...state.values,
        [action.path]: action.value,
      };
      let newErrors = { ...state.errors };
      if (action.fieldDefinition) { // Perform validation if FieldDefinition is provided
        const validationMessages = validateField(action.fieldDefinition, action.value);
        if (validationMessages.length > 0) {
          newErrors[action.path] = validationMessages;
        } else {
          delete newErrors[action.path]; // Clear errors if validation passes
        }
      }
      return { ...state, values: newValues, errors: newErrors };
    case 'SET_FIELD_ERRORS':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.path]: action.errors,
        },
      };
    case 'CLEAR_FIELD_ERRORS':
      const updatedErrors = { ...state.errors };
      delete updatedErrors[action.path];
      return { ...state, errors: updatedErrors };
    case 'SET_FORM_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };
    default:
      return state;
  }
};

export const FormStateProvider: React.FC<{ children: ReactNode, initialValues?: FormState }> = ({ children, initialValues = {} }) => {
  const [fullFormState, dispatch] = useReducer(formStateReducer, { ...initialState, values: initialValues });

  const updateFieldValue = useCallback((path: string, value: any, fieldDefinition?: FieldDefinition) => {
    dispatch({ type: 'UPDATE_FIELD_VALUE', path, value, fieldDefinition });
  }, []);

  const initializeForm = useCallback((initialStateData: FormState) => {
    dispatch({ type: 'INITIALIZE_FORM', initialValues: initialStateData });
  }, []);

  const setFieldErrors = useCallback((path: string, errors: string[]) => {
    dispatch({ type: 'SET_FIELD_ERRORS', path, errors });
  }, []);

  const clearFieldErrors = useCallback((path: string) => {
    dispatch({ type: 'CLEAR_FIELD_ERRORS', path });
  }, []);

  const validateAllFields = useCallback((processedSchema: ProcessedSchema): boolean => {
    if (!processedSchema || !processedSchema.formTemplate) return true;

    let allValid = true;
    const currentErrors: FormErrors = {};
    const { formTemplate, sectionTemplates, fieldGroupTemplates, fieldDefinitions } = processedSchema;
    const currentValues = fullFormState.values;

    formTemplate.sections.forEach(sectionLink => {
      const section = sectionTemplates[sectionLink.sectionId];
      if (section) {
        // Validate individual fields in the section
        section.individualFields.forEach(fieldId => {
          const fd = fieldDefinitions[fieldId];
          const path = \`\${section.id}.\${fieldId}\`;
          if (fd) {
            const errors = validateField(fd, currentValues[path]);
            if (errors.length > 0) {
              currentErrors[path] = errors;
              allValid = false;
            }
          }
        });
        // Validate fields within field groups in the section
        section.fieldGroups.forEach(groupId => {
          const group = fieldGroupTemplates[groupId];
          if (group) {
            // TODO: Handle repeatable groups - this currently only validates the first instance or non-repeatable
            group.fields.forEach(fieldId => {
              const fd = fieldDefinitions[fieldId];
              const path = group.repeatable
                           ? \`\${section.id}.\${group.id}[0].\${fieldId}\`
                           : \`\${section.id}.\${group.id}.\${fieldId}\`;
              if (fd) {
                const errors = validateField(fd, currentValues[path]);
                if (errors.length > 0) {
                  currentErrors[path] = errors;
                  allValid = false;
                }
              }
            });
          }
        });
      }
    });
    dispatch({ type: 'SET_FORM_ERRORS', errors: currentErrors });
    return allValid;
  }, [fullFormState.values]);


  return (
    <FormStateContext.Provider value={{
        formState: fullFormState.values,
        formErrors: fullFormState.errors,
        updateFieldValue,
        initializeForm,
        setFieldErrors,
        clearFieldErrors,
        validateAllFields
    }}>
      {children}
    </FormStateContext.Provider>
  );
};

export const useFormState = (): FormStateContextType => {
  const context = useContext(FormStateContext);
  if (context === undefined) {
    throw new Error('useFormState must be used within a FormStateProvider');
  }
  return context;
};
