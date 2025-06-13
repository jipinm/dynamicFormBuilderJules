import React, { useState, useEffect } from 'react';
import { SchemaProvider, useSchema } from './contexts/SchemaContext';
import SchemaFormRenderer from './components/dynamic-form/SchemaFormRenderer';
import './App.css'; // General app styles

// List of known schema files (without .json extension)
// In a real app, this might come from an API or a build step.
const availableSchemas = [
  'demographics-form-schema',
  'medication-form-schema',
  'adverse-event-form-schema',
  'lab-results-form-schema',
  'symptom-diary-form-schema',
];

const AppContent: React.FC = () => {
  const { loadSchema, isLoading, error, processedSchema, currentSchemaName } = useSchema();
  const [selectedSchema, setSelectedSchema] = useState<string>('');

  useEffect(() => {
    // If a schema name is selected, load it.
    if (selectedSchema) {
      loadSchema(selectedSchema);
    } else {
      // If no schema is selected (e.g., on initial load or when "Select a schema" is chosen)
      // you might want to clear the current schema or ensure loadSchema handles empty string appropriately.
      loadSchema(''); // Assuming loadSchema can handle empty string to clear/reset.
    }
  }, [selectedSchema, loadSchema]);

  const handleSchemaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchema(event.target.value);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Dynamic JSON Form Renderer</h1>
        <div className="schema-selector-container">
          <label htmlFor="schema-select">Select a Form to Render: </label>
          <select id="schema-select" value={selectedSchema} onChange={handleSchemaChange}>
            <option value="">-- Select a Schema --</option>
            {availableSchemas.map(name => (
              <option key={name} value={name}>
                {name.replace(/-/g, ' ').replace(/form schema/i, '').trim()
                  .replace(/\w/g, l => l.toUpperCase())} Form
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="app-main">
        {isLoading && <div className="loading-message">Loading schema...</div>}
        {error && <div className="error-message">Error: {error.message}</div>}

        {!isLoading && !error && processedSchema && currentSchemaName && (
          <SchemaFormRenderer />
        )}
        {!selectedSchema && !isLoading && (
          <p className="initial-prompt">Please select a form schema from the dropdown to begin.</p>
        )}
      </main>

      <footer className="app-footer">
        <p>Dynamic Form Renderer POC</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SchemaProvider>
      <AppContent />
    </SchemaProvider>
  );
};

export default App;
