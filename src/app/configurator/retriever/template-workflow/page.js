"use client";

import React from "react";
import { Box } from "@mui/material";
import TemplateWorkflow from "@/components/retriever/TemplateWorkflow";
import { useRetrieverStore } from "@/store/retrieverStore";

const TemplateWorkflowPage = () => {
  const { currentConnection } = useRetrieverStore();

  return (
    <Box sx={{ p: 3 }}>
      <TemplateWorkflow connectionId={currentConnection?.id} />
    </Box>
  );
};

export default TemplateWorkflowPage;
