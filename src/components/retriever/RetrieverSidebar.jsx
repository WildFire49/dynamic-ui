import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import {
  Storage as StorageIcon,
  Hub as GraphIcon,
  Psychology as AIIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

const RetrieverSidebar = ({
  activeStep,
  onStepChange,
  connectionExists,
  kgExists,
}) => {
  const steps = [
    {
      id: 0,
      title: "Database Connection",
      description: "Connect to your database",
      icon: StorageIcon,
      color: "#0078d7",
      completed: connectionExists,
      disabled: false,
    },
    {
      id: 1,
      title: "Build Knowledge Graph",
      description: "Select tables and build KG",
      icon: GraphIcon,
      color: "#48bb78",
      completed: kgExists,
      disabled: !connectionExists,
    },
    {
      id: 2,
      title: "Query & Analyze",
      description: "Ask questions in natural language",
      icon: AIIcon,
      color: "#9c27b0",
      completed: false,
      disabled: !kgExists,
    },
  ];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
        >
          Configuration Stages
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
          Follow these steps to configure
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = activeStep === step.id;

          return (
            <ListItem key={step.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => !step.disabled && onStepChange(step.id)}
                disabled={step.disabled}
                sx={{
                  borderRadius: 2,
                  minHeight: 72,
                  backgroundColor: isActive ? `${step.color}15` : "transparent",
                  border: isActive
                    ? `2px solid ${step.color}25`
                    : "2px solid transparent",
                  "&:hover": {
                    backgroundColor: step.disabled
                      ? "transparent"
                      : `${step.color}10`,
                    border: step.disabled
                      ? "2px solid transparent"
                      : `2px solid ${step.color}20`,
                  },
                  "&.Mui-disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: step.completed ? step.color : `${step.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {step.completed ? (
                      <CheckIcon sx={{ color: "white", fontSize: 20 }} />
                    ) : (
                      <IconComponent
                        sx={{
                          color: step.color,
                          fontSize: 20,
                        }}
                      />
                    )}
                  </Box>
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: isActive ? step.color : "text.primary",
                          fontSize: "0.95rem",
                        }}
                      >
                        {step.title}
                      </Typography>
                      {step.completed && (
                        <Chip
                          label="Done"
                          size="small"
                          sx={{
                            bgcolor: `${step.color}15`,
                            color: step.color,
                            fontWeight: 600,
                            height: 20,
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.8rem",
                        mt: 0.5,
                      }}
                    >
                      {step.description}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default RetrieverSidebar;
