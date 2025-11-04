import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import DynamicFormRenderer from "./dynamic-form/DynamicFormRenderer";

/**
 * DynamicDialogRenderer - A reusable dialog component for displaying forms
 * 
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onClose - Callback when dialog is closed
 * @param {object} dialogConfig - Dialog configuration (maxWidth, showAvatar, etc.)
 * @param {object} dialogActions - Actions configuration for dialog footer
 * @param {object} selectedItem - The item data to display in dialog
 * @param {object} formSchema - The schema for DynamicFormRenderer
 * @param {function} onSubmit - Callback when form is submitted
 * @param {function} onActionClick - Callback when action button is clicked
 */
const DynamicDialogRenderer = ({
  open = false,
  onClose,
  dialogConfig = {},
  dialogActions = {},
  selectedItem,
  formSchema,
  onSubmit,
  onActionClick,
}) => {
  const theme = useTheme();

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get avatar color based on name
  const getAvatarColor = (name) => {
    if (!name) return theme.palette.primary.main;
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Handle action button clicks
  const handleAction = (action) => {
    if (action === "close") {
      onClose();
    } else if (onActionClick) {
      onActionClick(action, selectedItem);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={dialogConfig.maxWidth || "md"}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {dialogConfig.showAvatar && selectedItem && (
            <Avatar
              sx={{
                bgcolor: getAvatarColor(selectedItem[dialogConfig.avatarKey]),
                width: 56,
                height: 56,
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {getInitials(selectedItem[dialogConfig.avatarKey])}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {selectedItem && selectedItem[dialogConfig.titleKey]}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {dialogConfig.subtitle || "Details"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 3, mt: 3 }}>
        {selectedItem && formSchema && (
          <DynamicFormRenderer
            formSchema={formSchema}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>

      {/* Dialog Actions/Footer */}
      {dialogActions.actions && dialogActions.actions.length > 0 && (
        <DialogActions
          sx={{
            p: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {dialogActions.actions.map((action) => (
            <Button
              key={action.id}
              onClick={() => handleAction(action.action)}
              variant={action.variant || "contained"}
              color={action.color || "primary"}
              sx={{ color: "white" }}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default DynamicDialogRenderer;
