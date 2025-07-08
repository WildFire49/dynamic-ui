"use client";

import React, { Suspense, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LoadingFallback from './LoadingFallback';

// Helper to convert schema properties to MUI sx props
const toSxProps = (properties) => {
  if (!properties) return {};

  const sx = {};
  const unitToRem = (value) => {
    if (typeof value !== 'string') return value;
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) return value;
    return `${intValue / 16}rem`;
  };

  // Layout & Spacing
  if (properties.padding) sx.p = unitToRem(properties.padding);
  if (properties.margin_bottom) sx.mb = unitToRem(properties.margin_bottom);

  // Colors
  if (properties.background_color) sx.backgroundColor = properties.background_color;
  if (properties.text_color) sx.color = properties.text_color;

  // Typography
  if (properties.text_align) sx.textAlign = properties.text_align;
  if (properties.text_size) sx.fontSize = unitToRem(properties.text_size);
  if (properties.text_style === 'bold') sx.fontWeight = 'bold';
  if (properties.text_style === 'italic') sx.fontStyle = 'italic';

  // Borders
  if (properties.corner_radius) sx.borderRadius = unitToRem(properties.corner_radius);

  return sx;
};

const componentMap = {
  button: dynamic(() => import('@/components/mui/Button')),
  input: dynamic(() => import('@/components/mui/Input')),
  text_input: dynamic(() => import('@/components/mui/Input')),
  text: dynamic(() => import('@/components/mui/Text')),
  video: dynamic(() => import('@/components/mui/Video'), { ssr: false }),
  image_capture: dynamic(() => import('@/components/mui/ImageCapture'), { ssr: false }),
  selector: dynamic(() => import('@/components/mui/Selector')),
  checkbox: dynamic(() => import('@/components/mui/Checkbox')),
  radio_group: dynamic(() => import('@/components/mui/RadioGroup')),
  file_upload: dynamic(() => import('@/components/mui/FileUpload'), { ssr: false }),
  success_notification: dynamic(() => import('@/components/mui/SuccessNotification')),
  location_capture: dynamic(() => import('@/components/mui/LocationCapture'), { ssr: false }),
  read_only_text: dynamic(() => import('@/components/mui/ReadOnlyText')),
  dashboard_metrics: dynamic(() => import('@/components/mui/DashboardMetrics')),
  camera_modal: dynamic(() => import('@/components/mui/CameraIntegrationModal'), { ssr: false }),
  text_review_panel: dynamic(() => import('@/components/mui/TextReviewPanel')),
  checkbox_list: dynamic(() => import('@/components/mui/CheckboxList')),
  multi_select_grid: dynamic(() => import('@/components/mui/MultiSelectGrid')),
  status_notification: dynamic(() => import('@/components/mui/StatusNotification')),
  emi_display_panel: dynamic(() => import('@/components/mui/EmiDisplayPanel')),
  review_panel: dynamic(() => import('@/components/mui/ReviewPanel')),
  // Structural components are handled directly in the renderer
  column: Grid,
  row: Grid,
};

const DynamicRenderer = ({ schema, onAction }) => {
  // Effect to handle non-visual, timed actions
  useEffect(() => {
    const actionComponents = schema?.ui_components?.filter(c => c.component_type === 'action') || [];
    actionComponents.forEach(component => {
      if (component.properties?.trigger_delay) {
        const timer = setTimeout(() => {
          if (onAction && component.properties.action) {
            onAction(component.properties.action.action_id);
          }
        }, component.properties.trigger_delay);
        // Cleanup the timer if the component unmounts
        return () => clearTimeout(timer);
      }
    });
  }, [schema, onAction]);

  if (!schema) {
    return <Typography color="error">Invalid UI schema: schema is missing.</Typography>;
  }

  // Handle nested screen structures
  const componentsToRender = schema.components || schema.ui_components || (Array.isArray(schema) ? schema : []);

  if (!Array.isArray(componentsToRender) || componentsToRender.length === 0) {
    return <Typography color="error">Invalid UI schema: no components found to render.</Typography>;
  }

  // Filter for components that are meant to be rendered visually
  const visualComponents = schema?.ui_components?.filter(c => c.component_type !== 'action') || [];

  if (!visualComponents.length) {
    // If only non-visual components exist, render nothing.
    return null;
  }

  const renderComponent = (component) => {
    const { id, component_type, properties, children } = component;
    const Component = componentMap[component_type];

    if (!Component) {
      console.warn(`Unknown component type: ${component_type}`);
      return (
        <Box key={id} sx={{ p: 2, border: '1px dashed red' }}>
          <Typography color="error">
            Unknown component type: {component_type}
          </Typography>
        </Box>
      );
    }

    const sxProps = toSxProps(properties);

    // Handle container components
    if (component_type === 'column' || component_type === 'row') {
      return (
        <Component
          container
          direction={component_type === 'column' ? 'column' : 'row'}
          spacing={properties?.spacing || 2}
          sx={sxProps}
        >
          {children && children.map(child => (
            <Grid item key={child.id} {...(properties?.grid_props || {})}>
              {renderComponent(child)}
            </Grid>
          ))}
        </Component>
      );
    }

    // Handle regular components
    const componentProps = properties ? { ...properties, ...sxProps } : sxProps;

    return (
      <Suspense fallback={<div key={id}>Loading...</div>}>
        <Component {...componentProps} onAction={onAction} />
      </Suspense>
    );
  };

  return (
    <>
      {visualComponents.map(component => (
        <div key={component.id}>
          {renderComponent(component)}
        </div>
      ))}
    </>
  );
};

export default DynamicRenderer;
