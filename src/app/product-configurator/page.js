"use client";

import {
  AccountBalance,
  ArrowBack,
  Assessment,
  Business,
  Description,
  FileCopy,
  InfoOutlined,
  Inventory,
  Link as LinkIcon,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  alpha,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import DynamicFormView from "../../components/DynamicFormView";
import DynamicLeadsRenderer from "../../components/DynamicLeadsRenderer";
import LeadsSidebar from "../../components/leads/LeadsSidebar";
import { productConfigSchema } from "../../components/productConfig";
import ProductConfigSidebar from "../../components/ProductConfigSidebar";
import { productConfigStages } from "../../components/productConfigStages";

// Icon mapping for stages
const iconMap = {
  Business: Business,
  Inventory: Inventory,
  Link: LinkIcon,
  Description: Description,
  AccountBalance: AccountBalance,
  InfoOutlined: InfoOutlined,
  FileCopy: FileCopy,
  Assessment: Assessment,
};

/**
 * Product Configurator Page
 * Reuses the same template as Leads page but with product configuration data
 */
export default function ProductConfiguratorPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState("products");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "form"
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [formData, setFormData] = useState({});

  console.log("🎯 Product Configurator - viewMode:", viewMode);

  // Close sidebar on mobile when component mounts
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab) => {
    console.log("Tab changed to:", tab);
    setActiveTab(tab);

    // Navigate to other routes if needed
    if (tab === "configurator") {
      window.location.href = "/configurator";
    } else if (tab === "leads") {
      window.location.href = "/leads";
    }
  };

  const handleCardClick = (product) => {
    console.log("Product clicked:", product);
    setSelectedProduct(product);
    // Open product in edit mode
    setFormData(product);
    setViewMode("form");
  };

  const handleCreateNew = () => {
    setFormData({});
    setCurrentStageIndex(0);
    setViewMode("form");
  };

  const handleBackToList = () => {
    console.log("📋 Back to list");
    setViewMode("list");
    setFormData({});
    setCurrentStageIndex(0);
  };

  const handleStageChange = (event, newValue) => {
    setCurrentStageIndex(newValue);
  };

  const handleFormDataChange = (stageId, fieldId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [stageId]: {
        ...(prevData[stageId] || {}),
        [fieldId]: value,
      },
    }));
    console.log("Form data updated:", stageId, fieldId, value);
  };

  const handleSave = (data) => {
    console.log("Product saved:", data);
    // TODO: Implement API call to save product configuration
  };

  const handleSaveDraft = () => {
    console.log("💾 Save draft:", formData);
    // TODO: Save as draft
  };

  const handleSubmit = () => {
    console.log("✅ Submit form:", formData);
    // TODO: Submit final form
    setViewMode("list");
  };

  const currentStage = productConfigStages.stages[currentStageIndex];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        width: "100%",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Sidebar */}
      <LeadsSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobile={isMobile}
        pageType="product-configurator"
      />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: { xs: 0, md: "0px" },
          width: {
            xs: "100%",
            md: `calc(100% - ${sidebarOpen ? "280px" : "0px"})`,
          },
          maxWidth: "100%",
          overflowX: "hidden",
          height: "100%",
          bgcolor: "#f5f7fa",
        }}
      >
        {/* Mobile Menu Button */}
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1200,
            }}
          >
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                backgroundColor: "white",
                boxShadow: 2,
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Dynamic Content - List View or Form View */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 0,
            m: 0,
          }}
        >
          {viewMode === "list" ? (
            /* List View - Product Cards */
            <DynamicLeadsRenderer
              config={productConfigSchema}
              onCardClick={handleCardClick}
              onSave={handleSave}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              onCreateNew={handleCreateNew}
            />
          ) : (
            /* Form View - 3-Column Flex Layout matching CustomerVerificationView */
            <Box
              sx={{
                display: "flex",
                height: "calc(100vh - 64px)",
                bgcolor: alpha(theme.palette.grey[50], 0.3),
                p: 2,
                gap: 2,
                overflow: "hidden",
                width: "100%",
                pt: { xs: 2, md: 3 },
              }}
            >
              {/* Left: Stage Queue Panel - Expanded width */}
              <Box
                sx={{
                  width: 340,
                  minWidth: 340,
                  bgcolor: "white",
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                  display: { xs: "none", lg: "flex" },
                  flexDirection: "column",
                  height: "100%",
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.grey[500],
                    0.08
                  )}`,
                  flexShrink: 0,
                }}
              >
                {/* Queue Header */}
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: "white",
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.1
                    )}`,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <IconButton
                      onClick={handleBackToList}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                        },
                      }}
                    >
                      <ArrowBack fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                    >
                      Product Configuration
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 2 }}
                  >
                    {formData.id
                      ? "Editing existing product"
                      : "Creating new product"}
                  </Typography>
                </Box>

                {/* Stage List with Colors & Chips from JSON */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    px: 1.5,
                    py: 1,
                    bgcolor: alpha(theme.palette.grey[50], 0.3),
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  {productConfigStages.stages.map((stage, index) => {
                    const StageIcon = iconMap[stage.icon];
                    const stageColor =
                      stage.color || theme.palette.primary.main;
                    const isActive = index === currentStageIndex;

                    return (
                      <Box
                        key={stage.id}
                        onClick={() => setCurrentStageIndex(index)}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          borderRadius: 2,
                          cursor: "pointer",
                          bgcolor: isActive
                            ? "white"
                            : alpha(theme.palette.grey[50], 0.3),
                          border: isActive
                            ? `2px solid ${stageColor}`
                            : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          boxShadow: isActive
                            ? `0 2px 8px ${alpha(stageColor, 0.2)}`
                            : "none",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "white",
                            boxShadow: `0 2px 6px ${alpha(
                              theme.palette.grey[500],
                              0.1
                            )}`,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.75,
                          }}
                        >
                          {StageIcon && (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                bgcolor: alpha(stageColor, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: stageColor,
                                fontSize: 16,
                              }}
                            >
                              <StageIcon fontSize="inherit" />
                            </Box>
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              color: alpha(theme.palette.text.secondary, 0.7),
                              letterSpacing: 0.5,
                            }}
                          >
                            STAGE {index + 1}
                          </Typography>
                        </Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.813rem",
                            color: isActive
                              ? stageColor
                              : theme.palette.text.primary,
                            mb: 0.75,
                            lineHeight: 1.3,
                          }}
                        >
                          {stage.shortTitle || stage.title}
                        </Typography>
                        {stage.chipLabel && (
                          <Chip
                            label={stage.chipLabel}
                            size="small"
                            color={stage.chipColor || "default"}
                            variant={isActive ? "filled" : "outlined"}
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              color: isActive ? "white" : "inherit",
                              "& .MuiChip-label": {
                                color: isActive ? "white" : "inherit",
                              },
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.grey[500],
                    0.08
                  )}`,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Form Header with Stage Title */}
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.1
                    )}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: theme.palette.success.main,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        letterSpacing: 1,
                      }}
                    >
                      Stage {currentStageIndex + 1} of{" "}
                      {productConfigStages.stages.length}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.success.main,
                        fontWeight: 700,
                      }}
                    >
                      {Math.round(
                        ((currentStageIndex + 1) /
                          productConfigStages.stages.length) *
                          100
                      )}
                      %
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      ((currentStageIndex + 1) /
                        productConfigStages.stages.length) *
                      100
                    }
                    sx={{
                      mb: 1.5,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: theme.palette.success.main,
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {currentStage?.title}
                  </Typography>
                </Box>

                {/* Form Content */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    bgcolor: "white",
                  }}
                >
                  <DynamicFormView
                    stageConfig={currentStage}
                    formData={formData}
                    onDataChange={handleFormDataChange}
                  />
                </Box>

                {/* Form Actions */}
                <Box
                  sx={{
                    p: 2.5,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: alpha(theme.palette.grey[50], 0.5),
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() =>
                      setCurrentStageIndex(Math.max(0, currentStageIndex - 1))
                    }
                    disabled={currentStageIndex === 0}
                  >
                    Previous
                  </Button>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={handleSaveDraft}>
                      Save Draft
                    </Button>
                    {currentStageIndex ===
                    productConfigStages.stages.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      >
                        Submit Configuration
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() =>
                          setCurrentStageIndex(
                            Math.min(
                              productConfigStages.stages.length - 1,
                              currentStageIndex + 1
                            )
                          )
                        }
                      >
                        Next Stage
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Right: Sidebar - 30% of viewport width */}
              <Box
                sx={{
                  width: "30vw",
                  minWidth: 380,
                  maxWidth: 500,
                  height: "100%",
                  display: { xs: "none", lg: "flex" },
                  flexDirection: "column",
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.grey[500],
                    0.08
                  )}`,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <ProductConfigSidebar
                  config={productConfigStages.sidebarConfig}
                  stages={productConfigStages.stages}
                  currentStageIndex={currentStageIndex}
                  formData={formData}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
