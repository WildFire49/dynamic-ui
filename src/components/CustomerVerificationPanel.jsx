import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  alpha,
  useTheme,
  Chip,
  IconButton,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  Badge,
  Fade,
  Grow,
  TransitionGroup,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Send,
  Image as ImageIcon,
  Person,
  Home,
  Business,
  AccountBalance,
  Description,
  ThumbUp,
  ThumbDown,
  Comment,
  Close,
  CompareArrows, // Used in comparison dialog
} from "@mui/icons-material";
import { getCustomerPanelConfig } from "./customerVerificationPanelConfig";

/**
 * CustomerVerificationPanel - Right sidebar for Customer View
 * Shows quick actions, photo thumbnails, verification checklist, and comments
 */
const CustomerVerificationPanel = ({
  verificationData,
  onAction,
  activeSectionId,
  setActiveSectionId,
}) => {
  const theme = useTheme();
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  // Automatically open compare dialog when 2 images are selected
  React.useEffect(() => {
    if (selectedImages.length === 2) {
      setCompareDialogOpen(true);
    }
  }, [selectedImages]);

  if (!verificationData) {
    return null;
  }

  const { customer } = verificationData;

  // Load configuration from JSON based on customer ID
  const customerId = customer?.mifixId || customer?.id || "default";
  const panelConfig = getCustomerPanelConfig(customerId);

  // Extract data from config
  const {
    documentImages = [],
    sections = [],
    stats = { totalFields: 0, verifiedFields: 0 },
    internalComments = [],
    actions = {},
  } = panelConfig;

  const allImages = documentImages;
  const totalFields = stats.totalFields;
  const verifiedFields = stats.verifiedFields;

  const handleApprove = () => {
    // Show confirmation dialog
    setApprovalDialogOpen(true);
  };

  const handleConfirmApproval = () => {
    if (onAction) {
      onAction("approve", { comment });
    }
    // Close dialog and reset comment
    setApprovalDialogOpen(false);
    setComment("");
  };

  const handleReject = () => {
    if (onAction) {
      onAction("reject", { comment });
    }
  };

  const handleSendBack = () => {
    if (onAction) {
      onAction("send_back", { comment });
    }
  };

  // Clicking on the image opens a viewer
  const handleImageClick = (image) => {
    setViewerImage(image);
    setViewerOpen(true);
  };

  // Checkbox toggles selection for comparison
  const handleToggleSelect = (image) => {
    const already = selectedImages.find((img) => img.id === image.id);
    if (already) {
      setSelectedImages(selectedImages.filter((img) => img.id !== image.id));
      return;
    }
    if (selectedImages.length < 2) {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handleCloseCompare = () => {
    setCompareDialogOpen(false);
    // Keep images selected so user can change one if needed
  };

  const handleClearSelection = () => {
    setSelectedImages([]);
    setCompareDialogOpen(false);
  };

  // Assumes 'activeSectionId' is your state variable
  // If it's named 'activeId', just use that instead.
  const sortedImages = React.useMemo(() => {
    // Create a new array to avoid mutating the original
    return [...allImages].sort((a, b) => {
      // Check if each image matches the active section
      const aIsActive = a.sectionId === activeSectionId;
      const bIsActive = b.sectionId === activeSectionId;

      // Sort logic:
      // This subtracts the boolean-as-a-number (true=1, false=0).
      // If b is active (1) and a is not (0), it returns 1 (b comes first).
      // If a is active (1) and b is not (0), it returns -1 (a comes first).
      // If both are the same (0-0 or 1-1), it returns 0 (original order).
      return Number(bIsActive) - Number(aIsActive);
    });
  }, [allImages, activeSectionId]); // Dependencies
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}
        >
          Verification Actions
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={`${verifiedFields}/${totalFields} Verified`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              fontWeight: 600,
            }}
          />
          <Chip
            label={panelConfig.customer.overallStatus}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          />
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {/* Quick Photo Preview */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ mb: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontSize: "0.7rem",
                }}
              >
                Photo Quick View
              </Typography>
              {selectedImages.length > 0 && (
                <Chip
                  label={`${selectedImages.length} selected`}
                  size="small"
                  onDelete={handleClearSelection}
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.688rem",
                display: "block",
              }}
            >
              {selectedImages.length === 0
                ? "Select 2 images to compare"
                : selectedImages.length === 1
                ? "Select 1 more to compare"
                : "Comparing..."}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
              position: "relative",
            }}
          >
            {sortedImages?.slice(0, 6).map((img, index) => {
              const isSelected = selectedImages.find((si) => si.id === img.id);
              const selectionIndex = selectedImages.findIndex(
                (si) => si.id === img.id
              );

              return (
                <Grow
                  key={img.id}
                  in={true}
                  timeout={{
                    enter: 400 + index * 100,
                    exit: 200,
                  }}
                  style={{ transformOrigin: "center center" }}
                >
                  <Tooltip title={img.label} arrow placement="top">
                    <Paper
                      onClick={() => handleImageClick(img)}
                      sx={{
                        position: "relative",
                        paddingTop: "100%",
                        borderRadius: 1.5,
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: isSelected
                          ? `3px solid ${theme.palette.primary.main}`
                          : "3px solid transparent",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 2,
                        },
                      }}
                    >
                    {/* Selection Checkbox */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        zIndex: 2,
                        bgcolor: "transparent",
                        borderRadius: 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        size="small"
                        checked={Boolean(isSelected)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(img);
                        }}
                        sx={{ p: 0.25 }}
                      />
                    </Box>
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={img.label}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(theme.palette.divider, 0.1),
                        }}
                      >
                        <ImageIcon sx={{ color: "text.disabled" }} />
                      </Box>
                    )}
                    {isSelected && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 30,
                          right: 4,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          boxShadow: 2,
                        }}
                      >
                        {selectionIndex + 1}
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 0.5,
                        bgcolor: alpha(theme.palette.common.black, 0.7),
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "white",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {img.label}
                      </Typography>
                    </Box>
                  </Paper>
                </Tooltip>
              </Grow>
              );
            })}
          </Box>
          {allImages.length > 6 && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                mt: 1,
                display: "block",
                textAlign: "center",
              }}
            >
              +{allImages.length - 6} more images
            </Typography>
          )}
        </Box>

        {/* Section Comments */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mb: 1.5,
              display: "block",
              fontSize: "0.7rem",
            }}
          >
            Section Comments
          </Typography>
          {sections
            .filter((s) => s.allowComments)
            .map((section) => (
              <Box key={section.id} sx={{ mb: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Comment
                      sx={{
                        fontSize: "0.875rem",
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder={`Add comments for ${section.title}...`}
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "0.813rem",
                      bgcolor: alpha(theme.palette.grey[50], 0.5),
                    },
                  }}
                />
              </Box>
            ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* General Comments */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mb: 1.5,
              display: "block",
              fontSize: "0.7rem",
            }}
          >
            General Comments
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add general verification comments here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "0.813rem",
              },
            }}
          />
        </Box>

        {/* Internal Review Comments - From JSON Config */}
        {internalComments.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1.5,
                display: "block",
                fontSize: "0.7rem",
              }}
            >
              Internal CPH Review Comment
            </Typography>
            {internalComments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor:
                    comment.status === "approved"
                      ? alpha(theme.palette.success.main, 0.05)
                      : alpha(theme.palette.error.main, 0.05),
                  border:
                    comment.status === "approved"
                      ? `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                      : `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <CheckCircle
                    sx={{
                      fontSize: 18,
                      color:
                        comment.status === "approved"
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      mt: 0.25,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: "0.813rem" }}
                  >
                    {comment.category}:
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.75rem", color: "text.secondary", pl: 3.5 }}
                >
                  {comment.text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Action Buttons - Fixed at Bottom - From JSON Config */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {actions.approve?.enabled && (
            <Button
              fullWidth
              variant="contained"
              color={actions.approve.color}
              startIcon={<ThumbUp />}
              onClick={handleApprove}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                py: 1.25,
                color: "white",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontSize: "0.813rem", color: "white" }}
              >
                {actions.approve.label}
              </Typography>
            </Button>
          )}

          {actions.reject?.enabled && (
            <Button
              fullWidth
              variant="contained"
              color={actions.reject.color}
              startIcon={<ThumbDown />}
              onClick={handleReject}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                py: 1.25,
              }}
            >
              {actions.reject.label}
            </Button>
          )}

          {actions.sendBack?.enabled && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Send />}
              onClick={handleSendBack}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                py: 1.25,
                backgroundColor: theme.palette.primary.main,
                color: "white",
              }}
            >
              {actions.sendBack.label}
            </Button>
          )}
        </Box>
      </Box>

      {/* Photo Comparison Dialog with 70% Visible Backdrop */}
      <Dialog
        open={compareDialogOpen}
        onClose={handleCloseCompare}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 2,
            maxHeight: "90vh",
          },
        }}
        BackdropProps={{
          sx: {
            bgcolor: alpha(theme.palette.common.black, 0.3), // 70% visible backdrop
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CompareArrows sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
              Compare Images
            </Typography>
          </Box>
          <IconButton onClick={handleCloseCompare} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            {selectedImages.map((img, index) => (
              <Box
                key={img.id}
                sx={{
                  flex: 1,
                  maxWidth: "45%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: "white",
                      fontWeight: 700,
                      width: 28,
                      height: 28,
                    }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {img.label}
                  </Typography>
                </Box>
                <Paper
                  elevation={3}
                  sx={{
                    position: "relative",
                    paddingTop: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.label}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        backgroundColor: "#f5f5f5",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.divider, 0.1),
                      }}
                    >
                      <ImageIcon
                        sx={{ fontSize: 64, color: "text.disabled" }}
                      />
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            pb: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle sx={{ fontSize: 28, color: "success.main" }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Approve Customer?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {customer?.name || "Customer"} - {customer?.mifixId}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are about to approve this customer's verification. This action will:
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
              Mark all verification fields as approved
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
              Move customer to next stage
            </Typography>
            <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
              Automatically select next customer in queue
            </Typography>
          </Box>
          {comment && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[100], 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                Your Comment:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {comment}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            p: 2,
            pt: 0,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setApprovalDialogOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.25,
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleConfirmApproval}
            startIcon={<ThumbUp />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.25,
              color: "white",
            }}
          >
            Approve & Continue
          </Button>
        </Box>
      </Dialog>

      {/* Single Image Viewer */}
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: "white",
            borderRadius: 2,
            width: 720,
            height: 720,
          },
        }}
        BackdropProps={{
          sx: { bgcolor: alpha(theme.palette.common.black, 0.3) },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
            {viewerImage?.label || "Image"}
          </Typography>
          <IconButton onClick={() => setViewerOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{ p: 0, height: "calc(720px - 64px)", overflow: "hidden" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              bgcolor: alpha(theme.palette.divider, 0.03),
            }}
          >
            {viewerImage?.url ? (
              <img
                src={viewerImage.url}
                alt={viewerImage.label}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  width: "auto",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.divider, 0.1),
                }}
              >
                <ImageIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CustomerVerificationPanel;
