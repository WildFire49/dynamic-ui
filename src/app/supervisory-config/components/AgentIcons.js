
import React from 'react';
import { Box } from '@mui/material';

// Custom Image Components for Agents - Reused from configurator/page.js
export const RetrieverImage = ({ sx, ...props }) => (
  <Box component="img" src="/seo.png" alt="Retriever" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const CommunicationImage = ({ sx, ...props }) => (
  <Box component="img" src="/chat-bubbles.png" alt="Communication" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const ActionImage = ({ sx, ...props }) => (
  <Box component="img" src="/critical-thinking.png" alt="Action" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const DbArchitectImage = ({ sx, ...props }) => (
  <Box component="img" src="/knowledge.png" alt="DB Architect" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const SchedulerImage = ({ sx, ...props }) => (
  <Box component="img" src="/schedule.png" alt="Scheduler" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const OcrImage = ({ sx, ...props }) => (
  <Box component="img" src="/ocr.png" alt="OCR" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const UiGeneratorImage = ({ sx, ...props }) => (
  <Box component="img" src="/generative-image.png" alt="UI Generator" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const BiometricsImage = ({ sx, ...props }) => (
  <Box component="img" src="/face-recognition.png" alt="Biometrics" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const NlpImage = ({ sx, ...props }) => (
  <Box component="img" src="/comment.png" alt="NLP" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const ApiIntegratorImage = ({ sx, ...props }) => (
  <Box component="img" src="/api.png" alt="API Integrator" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const WorkflowImage = ({ sx, ...props }) => (
  <Box component="img" src="/flowchart.png" alt="Workflow" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const ValidationImage = ({ sx, ...props }) => (
  <Box component="img" src="/validation.png" alt="Validation" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const MoreAgentsImage = ({ sx, ...props }) => (
  <Box component="img" src="/more-agents.png" alt="More Agents" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
export const SupervisoryImage = ({ sx, ...props }) => (
  <Box component="img" src="/supervisory.png" alt="Supervisory" sx={{ width: "100%", height: "100%", objectFit: "contain", ...sx }} {...props} />
);
