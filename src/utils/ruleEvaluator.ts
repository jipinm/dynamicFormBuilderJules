import { Condition, FieldDefinition, DisplayRule } from '../types/schema';
import { FormState } from '../contexts/FormStateContext';

/**
 * Evaluates a condition against the current form state.
 * @param condition The condition object from the schema.
 * @param formState The current state of the form.
 * @param fieldDefinitions A record of all field definitions, used for type-aware comparisons.
 * @param elementPath The base path of the element whose visibility is being determined (e.g., sectionId or sectionId.groupId).
 *                    This helps resolve relative field paths if condition.field is relative.
 * @returns boolean Result of the condition evaluation.
 */
export const evaluateCondition = (
  condition: Condition,
  formState: FormState,
  fieldDefinitions: Record<string, FieldDefinition>,
  elementPath?: string // Not fully used yet, but good for future relative path resolution
): boolean => {
  if (!condition.field) {
    // Handle conditions that don't rely on a specific field, e.g., patientAge or studyEvent
    // For now, these are not supported in this basic evaluator for field/group/section displayRules
    if (condition.patientAge) {
      console.warn("evaluateCondition: patientAge conditions not supported in this version.");
      return false;
    }
    if (condition.studyEvent) {
      console.warn("evaluateCondition: studyEvent conditions not supported in this version.");
      return false;
    }
    console.warn("evaluateCondition: Condition is missing 'field' property and is not a known form-level condition.", condition);
    return false; // Or true, depending on desired default for malformed rules
  }

  // Construct the full path to the field being evaluated if elementPath is provided and condition.field is relative
  // For now, assuming condition.field is an absolute path or an ID that needs to be mapped to a full path.
  // This part needs careful thought on how field paths are resolved in conditions.
  // Let's assume condition.field is a direct key in formState for now.
  const targetFieldPath = condition.field; // This is a simplification.

  const fieldValue = formState[targetFieldPath];
  const conditionValue = condition.value;

  // console.log(`Evaluating condition: Field '\${targetFieldPath}' (\${fieldValue}) \${condition.operator} \${conditionValue}`);

  switch (condition.operator) {
    case 'equals':
      // TODO: Consider type coercion based on FieldDefinition if available
      // For now, loose equality, but strict equality or type-aware comparison is better.
      // eslint-disable-next-line eqeqeq
      return fieldValue == conditionValue;
    case 'notEquals':
      // eslint-disable-next-line eqeqeq
      return fieldValue != conditionValue;
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    case '>=':
      return Number(fieldValue) >= Number(conditionValue);
    case '<=':
      return Number(fieldValue) <= Number(conditionValue);
    case '>':
      return Number(fieldValue) > Number(conditionValue);
    case '<':
      return Number(fieldValue) < Number(conditionValue);
    default:
      console.warn(\`Unsupported operator: \${condition.operator}\`);
      return false;
  }
};

/**
 * Determines if an element should be visible based on its display rules.
 * @param displayRules Array of display rules from the schema.
 * @param formState Current form state.
 * @param fieldDefinitions All field definitions.
 * @param elementPath Path of the current element.
 * @returns boolean True if visible, false otherwise.
 */
export const isElementVisible = (
  displayRules: DisplayRule[] | undefined | null,
  formState: FormState,
  fieldDefinitions: Record<string, FieldDefinition>,
  elementPath?: string
): boolean => {
  if (!displayRules || displayRules.length === 0) {
    return true; // Default to visible if no rules
  }

  // Simple logic: if any rule's condition is met, its 'visible' property determines visibility.
  // More complex scenarios might involve AND/ORing multiple rules.
  // For now, the first rule that evaluates true dictates visibility. If none evaluate true, default to true.
  // This could be refined: e.g. if a "visible: false" rule matches, it's hidden.

  let finalVisibility = true; // Default if no rule conditions are met
  let ruleMatched = false;

  for (const rule of displayRules) {
    if (evaluateCondition(rule.condition, formState, fieldDefinitions, elementPath)) {
      finalVisibility = rule.visible;
      ruleMatched = true;
      break; // First matched rule determines outcome
    }
  }

  // If no rule conditions were met, what should the default be?
  // Schemas seem to imply if a condition is met, then apply visibility.
  // If no conditions met, it implies the element is visible by default unless a rule says otherwise.
  // Let's stick to: if a rule matches, use its visibility. If no rule matches, default to visible.
  // This means an empty displayRules array or all rules evaluating to false will result in visible.

  return finalVisibility;
};
