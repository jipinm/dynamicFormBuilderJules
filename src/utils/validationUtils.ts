import { FieldDefinition, ValidationRule } from '../types/schema';

export const validateField = (
  fieldDefinition: FieldDefinition,
  value: any
): string[] => {
  const errors: string[] = [];
  if (!fieldDefinition.validationRules) {
    return errors;
  }

  for (const rule of fieldDefinition.validationRules) {
    let ruleViolated = false;
    const ruleValue = value; // Use the actual value passed

    switch (rule.type) {
      case 'required':
        if (ruleValue === undefined || ruleValue === null || ruleValue === '') {
          ruleViolated = true;
        }
        break;
      case 'range':
        const numValue = parseFloat(ruleValue);
        if (isNaN(numValue)) {
          // errors.push(\`\${fieldDefinition.label} must be a number for range validation.\`); // Or specific message
          // For now, if it's not a number, and range is specified, it could be an implicit type error
          // but let's assume required should catch empty, and pattern for format.
          // If a value is present but not a number, range validation might fail silently or be an issue.
          // Let's consider it a violation if it's not a number and range is specified.
           if (ruleValue !== undefined && ruleValue !== null && ruleValue !== '') { // only if there's some value
             errors.push(rule.message || \`\${fieldDefinition.label} is not a valid number for range check.\`);
           }
        } else {
          if (rule.min !== undefined && numValue < rule.min) {
            ruleViolated = true;
          }
          if (rule.max !== undefined && numValue > rule.max) {
            ruleViolated = true;
          }
        }
        break;
      case 'pattern':
        if (typeof ruleValue === 'string' && rule.pattern) {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(ruleValue)) {
            ruleViolated = true;
          }
        } else if (ruleValue !== undefined && ruleValue !== null && ruleValue !== '') {
          // If value is not a string but pattern rule exists, it's a mismatch for the rule itself.
          // Depending on strictness, this could be an error.
          // For now, pattern only applies to strings.
        }
        break;
      // Add other validation types here: 'minLength', 'maxLength', 'email', etc.
      default:
        console.warn(\`Unsupported validation type: \${rule.type} for field \${fieldDefinition.name}\`);
        break;
    }

    if (ruleViolated) {
      errors.push(rule.message || \`Validation failed for \${fieldDefinition.label} (\${rule.type})\`);
    }
  }
  return errors;
};
