I need you to build a dynamic form renderer in an existing React application using a JSON-driven architecture.

**🎯 CORE CONCEPT: JSON-Driven Form Rendering**
This React application uses a **declarative, schema-first approach**:
- **Everything** required to build and behave like a form comes from a JSON schema
- There are **NO hardcoded forms, fields, or layouts** in the React components
- The system **parses and interprets JSON schemas at runtime** and renders UI dynamically
- Think of it as a **"Form Rendering Engine"** — the React code is generic and reusable
- The same React components can render ANY form by simply changing the JSON schema

**Project Status:**
- React app already created at: E:/dynamicFormBuilder/DFBModelJules
- GitHub: https://github.com/jipinm/dynamicFormBuilderJules.git
- Form schemas located in: /public/data/ (5 JSON files in the app's public directory)

**Architecture Principle:**
You're building a RENDERER, not forms. The React components should:
- Read JSON schema → Interpret structure → Generate UI dynamically
- Have zero knowledge of specific forms (demographics, medications, etc.)
- Be completely data-driven and schema-agnostic

**Remaining Tasks:**

1. **Analyze JSON Schemas** (in /public/data/)
   - Understand the schema structure: FieldDefinition, FieldGroupTemplate, SectionTemplate, FormTemplate
   - Identify all possible field types, rules, and behaviors
   - This analysis will define what your renderer needs to support

2. **Build Schema Parser/Interpreter**
   - Create utilities to parse and validate schema structure
   - Build a schema context/provider for easy access
   - Handle schema versioning and structure validation

3. **Create Generic Rendering Components**
   - SchemaFormRenderer: Top-level component that accepts any schema
   - DynamicSection: Renders sections based on SectionTemplate
   - DynamicFieldGroup: Renders field groups with repeat logic
   - DynamicField: Renders individual fields based on FieldDefinition
   - NO hardcoded field names or form structures

4. **Build Field Factory Pattern**
   - Create a field component factory that maps dataType to components
   - Support all dataTypes found in schemas (string, integer, decimal, select, date)
   - Each field component receives its definition from schema, not props

5. **Implement Dynamic Behaviors**
   - Rule Engine: Interprets validationRules, displayRules, calculationRules
   - Visibility Engine: Shows/hides elements based on conditions
   - Validation Engine: Applies rules from schema
   - Calculation Engine: Computes derived values
   - All engines work purely from schema definitions

6. **State Management for Dynamic Forms**
   - Generic form state that works with any schema
   - Track values by field paths (e.g., "section.fieldGroup[0].fieldId")
   - Handle dynamic field additions/removals
   - Manage calculated fields and dependencies

7. **Build Landing Page**
   - Dropdown to select from available schemas
   - Load selected schema and pass to SchemaFormRenderer
   - Show loading states during schema fetch

8. **Apply Modern UI/UX**
   - Responsive, centered layout
   - Loading indicators
   - Clean, modern design
   - All styling should be generic and work with any form structure

**Example of Schema-Driven Approach:**
```javascript
// WRONG: Hardcoded approach
<PatientNameField required={true} />

// CORRECT: Schema-driven approach
<DynamicField definition={schemaFieldDefinition} />