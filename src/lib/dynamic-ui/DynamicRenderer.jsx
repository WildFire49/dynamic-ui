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
  if (properties.justifyContent) sx.justifyContent = properties.justifyContent;
  if (properties.alignItems) sx.alignItems = properties.alignItems;

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
  // Capitalized versions (existing)
  Button: dynamic(() => import('@/components/mui/Button')),
  Input: dynamic(() => import('@/components/mui/Input')),
  Text: dynamic(() => import('@/components/mui/Text')),
  Selector: dynamic(() => import('@/components/mui/Selector')),
  Checkbox: dynamic(() => import('@/components/mui/Checkbox')),
  CheckboxList: dynamic(() => import('@/components/mui/CheckboxList')),
  RadioGroup: dynamic(() => import('@/components/mui/RadioGroup')),
  FileUpload: dynamic(() => import('@/components/mui/FileUpload')),
  ImageCapture: dynamic(() => import('@/components/mui/ImageCapture')),
  LocationCapture: dynamic(() => import('@/components/mui/LocationCapture')),
  Video: dynamic(() => import('@/components/mui/Video')),
  Image: dynamic(() => import('@/components/mui/Image')),
  ReviewPanel: dynamic(() => import('@/components/mui/ReviewPanel')),
  TextReviewPanel: dynamic(() => import('@/components/mui/TextReviewPanel')),
  ReadOnlyText: dynamic(() => import('@/components/mui/ReadOnlyText')),
  EmiDisplayPanel: dynamic(() => import('@/components/mui/EmiDisplayPanel')),
  DashboardMetrics: dynamic(() => import('@/components/mui/DashboardMetrics')),
  MultiSelectGrid: dynamic(() => import('@/components/mui/MultiSelectGrid')),
  StatusNotification: dynamic(() => import('@/components/mui/StatusNotification')),
  SuccessNotification: dynamic(() => import('@/components/mui/SuccessNotification')),
  TypingIndicator: dynamic(() => import('@/components/mui/TypingIndicator')),
  Chat: dynamic(() => import('@/components/mui/Chat')),
  CameraIntegrationModal: dynamic(() => import('@/components/mui/CameraIntegrationModal')),
  ConfirmationDialog: dynamic(() => import('@/components/mui/ConfirmationDialog')),
  DataTable: dynamic(() => import('@/components/mui/DataTable')),
  OTPInput: dynamic(() => import('@/components/mui/OTPInput')),
  DatePicker: dynamic(() => import('@/components/mui/DatePicker')),
  FingerprintScanner: dynamic(() => import('@/components/mui/FingerprintScanner')),
  CustomerList: dynamic(() => import('@/components/mui/CustomerList')),
  Container: Box,
  
  // Lowercase versions (for backend compatibility)
  button: dynamic(() => import('@/components/mui/Button')),
  input: dynamic(() => import('@/components/mui/Input')),
  text: dynamic(() => import('@/components/mui/Text')),
  text_input: dynamic(() => import('@/components/mui/Input')),
  selector: dynamic(() => import('@/components/mui/Selector')),
  checkbox: dynamic(() => import('@/components/mui/Checkbox')),
  
  // Layout components
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
    if (component_type === 'Container' || component_type === 'column' || component_type === 'row') {
      return (
        <Box key={id} sx={{
          display: (component_type === 'column' || component_type === 'row') ? 'flex' : 'block',
          flexDirection: component_type === 'column' ? 'column' : 'row',
          gap: (component_type === 'column' || component_type === 'row') ? (properties?.spacing || 2) : undefined,
          ...sxProps
        }}>
          {children && children.map(child => (
            <React.Fragment key={child.id}>
              {renderComponent(child)}
            </React.Fragment>
          ))}
        </Box>
      );
    }

    // Handle regular components
    
    // Filter out CSS properties that should only go to sx prop
    const cssProperties = [
      'background_color', 'backgroundColor', 'text_color', 'textColor', 
      'border_radius', 'borderRadius', 'margin', 'padding', 'margin_bottom', 
      'margin_top', 'margin_left', 'margin_right', 'padding_top', 'padding_bottom',
      'padding_left', 'padding_right', 'text_size', 'fontSize', 'text_style',
      'fontWeight', 'text_align', 'textAlign', 'corner_radius', 'width', 'height',
      'vertical_arrangement', 'horizontal_alignment'
    ];
    
    // Separate component props from CSS props
    const componentProps = properties ? 
      Object.fromEntries(
        Object.entries(properties).filter(([key]) => !cssProperties.includes(key))
      ) : {};
    
    // Interactive components that should receive onAction
    const interactiveComponents = [
      'button', 'input', 'text_input', 'selector', 'checkbox', 'radio_group', 'file_upload', 'image_capture',
      'Button', 'Input', 'Selector', 'Checkbox', 'RadioGroup', 'FileUpload', 'ImageCapture', 'DatePicker', 'OTPInput', 'FingerprintScanner'
    ];
    const shouldPassOnAction = interactiveComponents.includes(component_type);
    
    const finalProps = {
      ...componentProps,
      sx: sxProps,
      ...(shouldPassOnAction && { onAction })
    };

    return (
      <Suspense fallback={<div key={id}>Loading...</div>}>
        <Component {...finalProps} />
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
