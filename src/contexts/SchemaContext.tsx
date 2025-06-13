import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProcessedSchema, FieldDefinition, SectionTemplate, FieldGroupTemplate } from '../types/schema';
import { fetchSchema, processSchema } from '../utils/schemaUtils';

interface SchemaContextType {
  processedSchema: ProcessedSchema | null;
  isLoading: boolean;
  error: Error | null;
  getFieldDefinition: (id: string) => FieldDefinition | undefined;
  getSectionTemplate: (id: string) => SectionTemplate | undefined;
  getFieldGroupTemplate: (id: string) => FieldGroupTemplate | undefined;
  currentSchemaName: string | null;
  loadSchema: (schemaName: string) => void;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export const SchemaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [processedSchema, setProcessedSchema] = useState<ProcessedSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSchemaName, setCurrentSchemaName] = useState<string | null>(null);

  const loadSchema = async (schemaName: string) => {
    if (!schemaName) {
      setProcessedSchema(null);
      setCurrentSchemaName(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const rawSchemaData = await fetchSchema(schemaName);
      const processed = processSchema(rawSchemaData);
      setProcessedSchema(processed);
      setCurrentSchemaName(schemaName);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load or process schema'));
      setProcessedSchema(null);
      setCurrentSchemaName(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get FieldDefinition by ID
  const getFieldDefinition = (id: string): FieldDefinition | undefined => {
    return processedSchema?.fieldDefinitions[id];
  };

  // Function to get SectionTemplate by ID
  const getSectionTemplate = (id: string): SectionTemplate | undefined => {
    return processedSchema?.sectionTemplates[id];
  };

  // Function to get FieldGroupTemplate by ID
  const getFieldGroupTemplate = (id: string): FieldGroupTemplate | undefined => {
    return processedSchema?.fieldGroupTemplates[id];
  };

  return (
    <SchemaContext.Provider value={{
        processedSchema,
        isLoading,
        error,
        getFieldDefinition,
        getSectionTemplate,
        getFieldGroupTemplate,
        currentSchemaName,
        loadSchema
    }}>
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchema = (): SchemaContextType => {
  const context = useContext(SchemaContext);
  if (context === undefined) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
};
