/**
 * Unified Form Renderer
 * Intelligent wrapper that detects schema type and renders the appropriate component
 * Supports both:
 * - Alpha API: Form-based schema (formSchema structure)
 * - Beta API: Workflow UI schema (forms.ui.sections structure)
 */

'use client';

import React, { useMemo } from 'react';
import { Box, Alert, Typography } from '@mui/material';
import DynamicFormRenderer from './DynamicFormRenderer';
import WorkflowUIRenderer from './WorkflowUIRenderer';
import { isBetaVersion } from '../../lib/api/workflowService';

/**
 * Detect schema type based on structure
 * @param {object} schema - The schema to detect
 * @returns {string} - 'form' for Alpha schema, 'workflow' for Beta schema, 'unknown' if cannot detect
 */
const detectSchemaType = (schema) => {
  if (!schema) return 'empty';

  // Handle empty objects
  if (typeof schema === 'object' && Object.keys(schema).length === 0) return 'empty';

  // Check for Beta API workflow structure (with ui_config wrapper)
  if (schema.ui_config && schema.ui_config.forms && schema.ui_config.forms.ui && schema.ui_config.forms.ui.sections) {
    return 'workflow';
  }

  // Check for Beta API workflow structure (direct forms)
  if (schema.forms && schema.forms.ui && schema.forms.ui.sections) {
    return 'workflow';
  }

  // Check for Alpha API form structure
  if (schema.sections && Array.isArray(schema.sections)) {
    const hasFormFields = schema.sections.some(section =>
      section.fields && Array.isArray(section.fields)
    );
    if (hasFormFields) {
      return 'form';
    }
  }

  // Check if it's a direct form schema (without wrapper)
  if (schema.id && schema.title && schema.sections) {
    return 'form';
  }

  // Check for wrapped format: { response: { type: "form_schema", schema: { sections: [...] } } }
  if (schema.response && schema.response.schema) {
    return detectSchemaType(schema.response.schema);
  }

  return 'unknown';
};

/**
 * Unified Form Renderer Component
 */
const UnifiedFormRenderer = ({
  schema,
  onSubmit,
  onContinue,
  onNavigate,
  viewOnly = false,
  skipNavigation = false,
}) => {
  // Detect schema type
  const schemaType = useMemo(() => {
    console.log('📦 UnifiedFormRenderer received schema:', schema);
    const detected = detectSchemaType(schema);
    console.log('🔍 Schema type detected:', detected);
    console.log('📊 Schema structure:', {
      hasUiConfig: !!schema?.ui_config,
      hasForms: !!schema?.forms,
      hasUiConfigForms: !!schema?.ui_config?.forms,
      hasFormsUi: !!schema?.forms?.ui,
      hasSections: !!schema?.sections,
    });
    return detected;
  }, [schema]);

  // Check API version
  const apiVersion = useMemo(() => {
    return isBetaVersion() ? 'beta' : 'alpha';
  }, []);

  // Handle workflow UI submission
  const handleWorkflowSubmit = (data) => {
    console.log('Workflow submitted:', data);
    if (onSubmit) {
      onSubmit(data);
    }
  };

  // Handle workflow navigation
  const handleWorkflowNavigate = (direction) => {
    console.log('Workflow navigate:', direction);
    if (onNavigate) {
      onNavigate(direction);
    }
  };

  // Unwrap { response: { schema: {...} } } wrapper if present
  const unwrappedSchema = useMemo(() => {
    if (schema?.response?.schema) {
      return schema.response.schema;
    }
    return schema;
  }, [schema]);

  // Render appropriate component based on schema type
  if (schemaType === 'empty') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No form data available yet. Use the configure button to generate a UI.
        </Typography>
      </Box>
    );
  }

  if (schemaType === 'workflow') {
    // Normalize schema - extract forms from ui_config if wrapped
    const normalizedSchema = unwrappedSchema.ui_config ? unwrappedSchema.ui_config.forms : unwrappedSchema;

    return (
      <Box>
        <WorkflowUIRenderer
          uiConfig={normalizedSchema}
          onSubmit={handleWorkflowSubmit}
          onNavigate={handleWorkflowNavigate}
        />
      </Box>
    );
  }

  if (schemaType === 'form') {
    return (
      <Box>
        <DynamicFormRenderer
          formSchema={unwrappedSchema}
          onSubmit={onSubmit}
          onContinue={onContinue}
          viewOnly={viewOnly}
          skipNavigation={skipNavigation}
        />
      </Box>
    );
  }

  // Unknown schema type
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">
        <strong>Unknown schema format</strong>
        <br />
        Cannot determine if this is a form schema or workflow UI schema.
        <br />
        API Version: {apiVersion}
        <br />
        Please check your schema structure.
      </Alert>
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto', maxHeight: 400 }}>
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(schema, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};

export default UnifiedFormRenderer;
