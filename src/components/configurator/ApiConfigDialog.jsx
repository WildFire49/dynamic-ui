"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Chip,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
  alpha,
  useTheme,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Divider,
} from "@mui/material";
import {
  Close,
  Add,
  Delete,
  Send,
  CheckCircle,
  Error as ErrorIcon,
  ContentPaste,
  Code,
  KeyboardArrowDown,
} from "@mui/icons-material";
import {
  parseCurlCommand,
  validateApiConfig,
  testApiCall,
  cleanHeaders,
  getHeaderImportance,
} from "@/utils/curlParser";

const ApiConfigDialog = ({ open, onClose, onSave, initialConfig = null, buttonLabel }) => {
  const theme = useTheme();
  const [showCurlImport, setShowCurlImport] = useState(true);
  const [detailTab, setDetailTab] = useState(0); // 0: Params, 1: Headers, 2: Body
  const [curlCommand, setCurlCommand] = useState("");
  const [apiConfig, setApiConfig] = useState({
    method: "GET",
    url: "",
    headers: {},
    body: null,
    params: {},
  });
  const [newHeader, setNewHeader] = useState({ key: "", value: "" });
  const [newParam, setNewParam] = useState({ key: "", value: "" });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [errors, setErrors] = useState([]);

  // HTTP method colors (Postman-like)
  const getMethodColor = (method) => {
    const colors = {
      GET: "#61affe",
      POST: "#49cc90",
      PUT: "#fca130",
      PATCH: "#50e3c2",
      DELETE: "#f93e3e",
    };
    return colors[method] || "#61affe";
  };

  useEffect(() => {
    if (initialConfig) {
      setApiConfig(initialConfig);
      setShowCurlImport(false);
    }
  }, [initialConfig]);

  const handleParseCurl = () => {
    const parsed = parseCurlCommand(curlCommand);
    if (parsed) {
      setApiConfig(parsed);
      setShowCurlImport(false);
      
      // Check if POST/PUT/PATCH but no body
      const warnings = [];
      if (['POST', 'PUT', 'PATCH'].includes(parsed.method) && !parsed.body) {
        warnings.push(
          `⚠️ ${parsed.method} request detected but no body found in cURL. You may need to add request body manually in the Body tab.`
        );
      }
      
      setErrors(warnings);
    } else {
      setErrors(["Failed to parse cURL command. Please check the format."]);
    }
  };

  const handleApiConfigChange = (field, value) => {
    setApiConfig((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleAddHeader = () => {
    if (newHeader.key && newHeader.value) {
      setApiConfig((prev) => ({
        ...prev,
        headers: { ...prev.headers, [newHeader.key]: newHeader.value },
      }));
      setNewHeader({ key: "", value: "" });
    }
  };

  const handleDeleteHeader = (key) => {
    setApiConfig((prev) => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const handleAddParam = () => {
    if (newParam.key && newParam.value) {
      setApiConfig((prev) => ({
        ...prev,
        params: { ...prev.params, [newParam.key]: newParam.value },
      }));
      setNewParam({ key: "", value: "" });
    }
  };

  const handleDeleteParam = (key) => {
    setApiConfig((prev) => {
      const newParams = { ...prev.params };
      delete newParams[key];
      return { ...prev, params: newParams };
    });
  };

  const handleTestApi = async () => {
    const validation = validateApiConfig(apiConfig);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setTesting(true);
    setTestResult(null);
    const result = await testApiCall(apiConfig);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    const validation = validateApiConfig(apiConfig);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(apiConfig);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "90vh", display: "flex", flexDirection: "column" } }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            API Request Builder
          </Typography>
          <Chip
            label={buttonLabel}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              fontWeight: 500,
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* cURL Import */}
      <Collapse in={showCurlImport}>
        <Box sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.02), borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <ContentPaste fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Import from cURL
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
            placeholder="Paste your cURL command here..."
            sx={{
              mb: 2,
              "& .MuiInputBase-root": {
                fontFamily: "Consolas, Monaco, monospace",
                fontSize: "0.85rem",
                bgcolor: "#f8f9fa",
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Code />}
              onClick={handleParseCurl}
              disabled={!curlCommand.trim()}
              sx={{ textTransform: "none" }}
            >
              Parse & Configure
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowCurlImport(false)}
              sx={{ textTransform: "none" }}
            >
              Manual Setup
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Errors/Warnings */}
      {errors.length > 0 && (
        <Alert 
          severity={errors[0].startsWith('⚠️') ? "warning" : "error"} 
          onClose={() => setErrors([])} 
          sx={{ m: 2, mb: 0 }}
        >
          {errors.map((error, idx) => (
            <Typography key={idx} variant="body2">
              {error}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Request Builder (Postman-style) */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Method + URL + Send */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* Method Dropdown */}
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={apiConfig.method}
                onChange={(e) => handleApiConfigChange("method", e.target.value)}
                size="small"
                sx={{
                  fontWeight: 600,
                  color: getMethodColor(apiConfig.method),
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(getMethodColor(apiConfig.method), 0.3),
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: getMethodColor(apiConfig.method),
                  },
                }}
              >
                <MenuItem value="GET" sx={{ color: getMethodColor("GET"), fontWeight: 600 }}>GET</MenuItem>
                <MenuItem value="POST" sx={{ color: getMethodColor("POST"), fontWeight: 600 }}>POST</MenuItem>
                <MenuItem value="PUT" sx={{ color: getMethodColor("PUT"), fontWeight: 600 }}>PUT</MenuItem>
                <MenuItem value="PATCH" sx={{ color: getMethodColor("PATCH"), fontWeight: 600 }}>PATCH</MenuItem>
                <MenuItem value="DELETE" sx={{ color: getMethodColor("DELETE"), fontWeight: 600 }}>DELETE</MenuItem>
              </Select>
            </FormControl>

            {/* URL Input */}
            <TextField
              fullWidth
              size="small"
              value={apiConfig.url}
              onChange={(e) => handleApiConfigChange("url", e.target.value)}
              placeholder="Enter request URL"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "Consolas, Monaco, monospace",
                  fontSize: "0.9rem",
                },
              }}
            />

            {/* Send Button */}
            <Button
              variant="contained"
              startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <Send />}
              onClick={handleTestApi}
              disabled={testing || !apiConfig.url}
              sx={{
                textTransform: "none",
                minWidth: 100,
                bgcolor: getMethodColor(apiConfig.method),
                "&:hover": {
                  bgcolor: alpha(getMethodColor(apiConfig.method), 0.8),
                },
              }}
            >
              Send
            </Button>
          </Box>

          {!showCurlImport && (
            <Button
              size="small"
              startIcon={<ContentPaste />}
              onClick={() => setShowCurlImport(true)}
              sx={{ mt: 1, textTransform: "none", fontSize: "0.75rem" }}
            >
              Import cURL
            </Button>
          )}
        </Box>

        {/* Tabs: Params, Headers, Body */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: "#fafafa" }}>
          <Tabs
            value={detailTab}
            onChange={(e, newValue) => setDetailTab(newValue)}
            sx={{
              minHeight: 42,
              "& .MuiTab-root": {
                minHeight: 42,
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Params
                  {Object.keys(apiConfig.params).length > 0 && (
                    <Chip
                      label={Object.keys(apiConfig.params).length}
                      size="small"
                      sx={{ height: 18, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Headers
                  {Object.keys(apiConfig.headers).length > 0 && (
                    <Chip
                      label={Object.keys(apiConfig.headers).length}
                      size="small"
                      sx={{ height: 18, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label="Body"
              disabled={!["POST", "PUT", "PATCH"].includes(apiConfig.method)}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2, bgcolor: "#fff" }}>
          {/* Params Tab */}
          {detailTab === 0 && (
            <Box>
              <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
                <TextField
                  size="small"
                  placeholder="Key"
                  value={newParam.key}
                  onChange={(e) => setNewParam({ ...newParam, key: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  placeholder="Value"
                  value={newParam.value}
                  onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={handleAddParam}
                  disabled={!newParam.key || !newParam.value}
                  color="primary"
                >
                  <Add />
                </IconButton>
              </Box>

              {Object.keys(apiConfig.params).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                  No query parameters yet
                </Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {Object.entries(apiConfig.params).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{key}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{value}</TableCell>
                        <TableCell width={50}>
                          <IconButton size="small" onClick={() => handleDeleteParam(key)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}

          {/* Headers Tab */}
          {detailTab === 1 && (
            <Box>
              <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
                <TextField
                  size="small"
                  placeholder="Key"
                  value={newHeader.key}
                  onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  placeholder="Value"
                  value={newHeader.value}
                  onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={handleAddHeader}
                  disabled={!newHeader.key || !newHeader.value}
                  color="primary"
                >
                  <Add />
                </IconButton>
              </Box>

              {/* Clean Headers Button */}
              {Object.keys(apiConfig.headers).length > 3 && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const cleaned = cleanHeaders(apiConfig.headers);
                      setApiConfig((prev) => ({ ...prev, headers: cleaned }));
                    }}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.75rem",
                    }}
                  >
                    Clean Browser Headers
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Remove unnecessary browser-generated headers
                  </Typography>
                </Box>
              )}

              {Object.keys(apiConfig.headers).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                  No headers yet
                </Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {Object.entries(apiConfig.headers).map(([key, value]) => {
                      const importance = getHeaderImportance(key);
                      const importanceColor = {
                        essential: "#49cc90",
                        important: "#fca130",
                        optional: "#9e9e9e",
                      }[importance];

                      return (
                        <TableRow key={key}>
                          <TableCell sx={{ width: 200 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: importanceColor,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.85rem",
                                  fontWeight: importance === "essential" ? 600 : 400,
                                }}
                              >
                                {key}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem", wordBreak: "break-all" }}>
                            {value.length > 100 ? `${value.substring(0, 100)}...` : value}
                          </TableCell>
                          <TableCell width={50}>
                            <IconButton size="small" onClick={() => handleDeleteHeader(key)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}

          {/* Body Tab */}
          {detailTab === 2 && (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={12}
                value={
                  typeof apiConfig.body === "string"
                    ? apiConfig.body
                    : JSON.stringify(apiConfig.body, null, 2) || ""
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleApiConfigChange("body", parsed);
                  } catch {
                    handleApiConfigChange("body", e.target.value);
                  }
                }}
                placeholder='{\n  "key": "value"\n}'
                sx={{
                  "& .MuiInputBase-root": {
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "0.85rem",
                    bgcolor: "#f8f9fa",
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Response Section */}
        {testResult && (
          <Box
            sx={{
              borderTop: `2px solid ${theme.palette.divider}`,
              bgcolor: testResult.success ? alpha("#49cc90", 0.05) : alpha("#f93e3e", 0.05),
            }}
          >
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: testResult.success ? alpha("#49cc90", 0.1) : alpha("#f93e3e", 0.1),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {testResult.success ? (
                  <CheckCircle sx={{ color: "#49cc90" }} />
                ) : (
                  <ErrorIcon sx={{ color: "#f93e3e" }} />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {testResult.success ? "Success" : "Failed"}
                </Typography>
                {testResult.status && (
                  <Chip
                    label={`${testResult.status} ${testResult.statusText || ""}`}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>
              <IconButton size="small" onClick={() => setTestResult(null)}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 2, maxHeight: 200, overflow: "auto" }}>
              <TextField
                fullWidth
                multiline
                value={JSON.stringify(testResult.data || testResult.error, null, 2)}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-root": {
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "0.8rem",
                    bgcolor: "#fff",
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "#fafafa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Configure API call for button "{buttonLabel}"
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!apiConfig.url}
            sx={{ textTransform: "none" }}
          >
            Save Configuration
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ApiConfigDialog;
