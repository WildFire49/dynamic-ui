import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  alpha,
  useTheme,
  Paper,
  Avatar,
  Button,
  TextField,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Warning,
  ZoomIn,
  Person,
  Home,
  Business,
  AccountBalance,
  Description,
  Comment,
  ArrowBack,
} from "@mui/icons-material";

/**
 * CustomerVerificationView - Main screen component for data validation
 * Shows all data points captured from mobile for web-based verification
 */
const CustomerVerificationView = ({ verificationData, onFieldVerify, onBack }) => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [compareImages, setCompareImages] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [sectionComments, setSectionComments] = useState({});

  if (!verificationData) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "text.secondary",
        }}
      >
        <Typography variant="h6">Select a customer to view verification details</Typography>
      </Box>
    );
  }

  const { customer, sections } = verificationData;
  const { verificationProgress } = customer;

  // Get verification status color
  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return theme.palette.success.main;
      case "pending":
        return theme.palette.warning.main;
      case "rejected":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleImageSelect = (image) => {
    if (compareImages.length === 0) {
      setCompareImages([image]);
    } else if (compareImages.length === 1) {
      if (compareImages[0].id === image.id) {
        setCompareImages([]); // Deselect if same image
      } else {
        setCompareImages([compareImages[0], image]);
        setShowComparison(true);
      }
    } else {
      setCompareImages([image]); // Reset and start new selection
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return theme.palette.success.main;
    if (confidence >= 75) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Render data field with verification status - Simple, clean layout
  const renderDataField = (field) => {
    const statusColor =
      field.status === "verified"
        ? theme.palette.success.main
        : field.status === "pending"
        ? theme.palette.warning.main
        : theme.palette.error.main;

    return (
      <Box
        key={field.id}
        sx={{
          py: 1.5,
          px: 0.5,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: "0.688rem",
              letterSpacing: "0.5px",
            }}
          >
            {field.label}
          </Typography>
          {field.status === "verified" && (
            <CheckCircle sx={{ fontSize: 18, color: statusColor }} />
          )}
          {field.status === "pending" && (
            <Warning sx={{ fontSize: 18, color: statusColor }} />
          )}
          {field.status === "rejected" && (
            <Cancel sx={{ fontSize: 18, color: statusColor }} />
          )}
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 600, 
            fontSize: "0.938rem",
            color: "text.primary",
            mb: field.subValue || field.flagged ? 0.5 : 0,
            wordBreak: field.type === "longtext" ? "break-word" : "break-word",
            whiteSpace: field.type === "longtext" ? "normal" : "normal",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: field.type === "longtext" ? 1.6 : 1.5,
            maxWidth: "100%",
            overflowWrap: "break-word",
          }}
        >
          {field.value || "—"}
        </Typography>
        {field.subValue && (
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem", display: "block" }}>
            {field.subValue}
          </Typography>
        )}
        {field.flagged && (
          <Typography variant="caption" sx={{ color: theme.palette.error.main, fontSize: "0.75rem", display: "block", mt: 0.5 }}>
            ⚠ {field.reason}
          </Typography>
        )}
      </Box>
    );
  };

  // Render image field with zoom capability and selection for comparison
  const renderImageField = (field) => {
    const isSelected = compareImages.some(img => img.id === field.id);
    const confidence = field.confidence || 0;
    
    return (
      <Paper
        key={field.id}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.2s",
          border: isSelected ? `3px solid ${theme.palette.primary.main}` : "3px solid transparent",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: 3,
          },
        }}
        onClick={() => handleImageSelect(field)}
      >
        <Box
          sx={{
            position: "relative",
            paddingTop: "75%", // 4:3 aspect ratio
            bgcolor: alpha(theme.palette.divider, 0.1),
            overflow: "hidden",
          }}
        >
          {field.url ? (
            <img
              src={field.url}
              alt={field.label}
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
              }}
            >
              <ImageIcon sx={{ fontSize: 48, color: "text.disabled" }} />
            </Box>
          )}
          {/* Status Badge */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: alpha(getStatusColor(field.status), 0.9),
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            {field.status.toUpperCase()}
          </Box>

          {/* Confidence Badge */}
          {confidence > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: alpha(getConfidenceColor(confidence), 0.9),
                color: "white",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {confidence}%
            </Box>
          )}

          {/* Selection Indicator */}
          {isSelected && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                bgcolor: theme.palette.primary.main,
                color: "white",
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {compareImages.findIndex(img => img.id === field.id) + 1}
            </Box>
          )}

          {/* Zoom Icon */}
          <IconButton
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: alpha(theme.palette.common.black, 0.6),
              color: "white",
              width: 28,
              height: 28,
              "&:hover": {
                bgcolor: alpha(theme.palette.common.black, 0.8),
              },
            }}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(field);
            }}
          >
            <ZoomIn fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
            {field.label}
          </Typography>
          {field.flagged && (
            <Typography variant="caption" sx={{ color: theme.palette.error.main, fontSize: "0.7rem" }}>
              ⚠ {field.reason}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };

  // Render section icon
  const getSectionIcon = (iconName) => {
    const iconMap = {
      Person,
      Home,
      Business,
      AccountBalance,
      Description,
    };
    const Icon = iconMap[iconName] || Description;
    return <Icon />;
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        bgcolor: alpha(theme.palette.grey[50], 0.3),
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* Customer Header - Compact Card */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 3, xl: 3 }, pt: { xs: 2, lg: 2.5 }, pb: 1, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2.5,
            background: "white",
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.06)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.primary.main, 0.9),
                fontSize: "1.5rem",
                fontWeight: 700,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              {customer.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: "1.25rem" }}>
                {customer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "0.875rem" }}>
                {customer.mifixId} • {customer.product}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`${verificationProgress.completed}/${verificationProgress.total} Fields`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
                <Chip
                  label={customer.overallStatus.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: alpha(getStatusColor(customer.overallStatus), 0.1),
                    color: getStatusColor(customer.overallStatus),
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Sections */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 3, xl: 3 }, pb: { xs: 2, sm: 3 }, pt: 1.5, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
        {sections.filter(s => s.type === "data").map((section, sectionIndex) => (
          <Paper
            key={section.id}
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 1.5,
              overflow: "hidden",
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              bgcolor: "background.paper",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {/* Section Header */}
            <Box
              sx={{
                px: 4,
                py: 2,
                bgcolor: alpha(theme.palette.grey[50], 0.5),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mr: 0.5,
                }}
              >
                {section.icon === "Person" && <Person sx={{ fontSize: 22, color: theme.palette.primary.main }} />}
                {section.icon === "Home" && <Home sx={{ fontSize: 22, color: theme.palette.primary.main }} />}
                {section.icon === "Business" && <Business sx={{ fontSize: 22, color: theme.palette.primary.main }} />}
                {section.icon === "AccountBalance" && <AccountBalance sx={{ fontSize: 22, color: theme.palette.primary.main }} />}
                {section.icon === "Description" && <Description sx={{ fontSize: 22, color: theme.palette.primary.main }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.063rem", mb: 0 }}>
                  {section.title}
                </Typography>
                {section.subtitle && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.813rem" }}>
                    {section.subtitle}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                {section.allowComments && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      // Trigger sidebar to open Customer View tab with this section
                      if (onBack) {
                        onBack({ action: 'openComments', sectionId: section.id, sectionTitle: section.title });
                      }
                    }}
                    sx={{
                      color: sectionComments[section.id] ? theme.palette.primary.main : theme.palette.text.secondary,
                      "&:hover": { color: theme.palette.primary.main },
                    }}
                  >
                    <Comment sx={{ fontSize: "1.125rem" }} />
                  </IconButton>
                )}
                <Chip
                  label={`${section.fields.filter(f => f.status === "verified").length}/${section.fields.length}`}
                  size="small"
                  icon={<CheckCircle sx={{ fontSize: "0.938rem !important" }} />}
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    fontWeight: 600,
                    fontSize: "0.813rem",
                    height: 26,
                  }}
                />
              </Box>
            </Box>

            {/* Section Content */}
            <Box sx={{ px: { xs: 2, sm: 3, lg: 3, xl: 4 }, py: { xs: 2, sm: 2.5, lg: 3 }, overflow: "hidden", width: "100%" }}>
              <Grid container spacing={{ xs: 2, sm: 2.5, lg: 3 }}>
                {section.fields.map((field, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={field.type === "longtext" ? 12 : 6} 
                    md={field.type === "longtext" ? 12 : 3} 
                    key={field.id}
                    sx={{
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    {renderDataField(field)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Image Modal (Simple version - can be enhanced) */}
      {selectedImage && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: alpha(theme.palette.common.black, 0.9),
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.url}
            alt={selectedImage.label}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
            }}
          />
        </Box>
      )}

    {/* Image Comparison Modal */}
    {showComparison && compareImages.length === 2 && (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: alpha(theme.palette.common.black, 0.9),
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
        onClick={() => setShowComparison(false)}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Image Comparison
            </Typography>
            <IconButton onClick={() => setShowComparison(false)}>
              <Cancel />
            </IconButton>
          </Box>
          
          <Grid container spacing={3}>
            {compareImages.map((image, index) => (
              <Grid item xs={12} md={6} key={image.id}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    {image.label}
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 400,
                      mx: "auto",
                      borderRadius: 2,
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.label}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                    <Chip
                      label={`Status: ${image.status}`}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(image.status), 0.1),
                        color: getStatusColor(image.status),
                      }}
                    />
                    {image.confidence && (
                      <Chip
                        label={`Confidence: ${image.confidence}%`}
                        size="small"
                        sx={{
                          bgcolor: alpha(getConfidenceColor(image.confidence), 0.1),
                          color: getConfidenceColor(image.confidence),
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="outlined"
              onClick={() => {
                setShowComparison(false);
                setCompareImages([]);
              }}
              sx={{ mr: 2 }}
            >
              Close Comparison
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // Handle verification action
                console.log("Images verified for comparison");
                setShowComparison(false);
                setCompareImages([]);
              }}
            >
              Verify Match
            </Button>
          </Box>
        </Box>
      </Box>
    )}
  </Box>
  );
};

export default CustomerVerificationView;
