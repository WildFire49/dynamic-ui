"use client";

import React from 'react';
import loadable from '@loadable/component';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const componentMap = {
  button: loadable(() => import('@/components/mui/Button'), {
    fallback: <CircularProgress />,
  }),
  text_input: loadable(() => import('@/components/mui/Input'), {
    fallback: <CircularProgress />,
  }),
  // Add other MUI components here as they are created
};

const DynamicRenderer = ({ schema }) => {
  const renderComponent = (component) => {
    const Component = componentMap[component.component_type];

    if (!Component) {
      console.warn(`Component type "${component.component_type}" not found.`);
      return null;
    }

    const { children, ...props } = component.properties || {};

    return (
      <Box key={component.id} sx={{ mb: 2 }}>
        <Component {...props}>
          {children && children.map(renderComponent)}
        </Component>
      </Box>
    );
  };

  return <>{schema.map(renderComponent)}</>;
};

export default DynamicRenderer;

