"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Clear as ClearIcon,
  MoreVert as MoreIcon,
  Cloud as CloudIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import useRetrieverStore from "../../../../store/retrieverStore";

const SelfLearningPage = () => {
  const { currentConnection } = useRetrieverStore();

  // State
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDocId, setMenuDocId] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load saved documents from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selfLearningDocs");
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load documents:", e);
      }
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("selfLearningDocs", JSON.stringify(documents));
    }
  }, [documents]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Only allow txt and doc files
    const allowedTypes = [
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".txt") &&
      !file.name.endsWith(".doc") &&
      !file.name.endsWith(".docx")
    ) {
      setMessage({
        type: "error",
        text: "Only .txt, .doc, and .docx files are allowed",
      });
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        content: text,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };

      setDocuments((prev) => [...prev, newDoc]);
      setSelectedDoc(newDoc);
      setContent(text);
      setFilename(file.name);
      setUploading(false);
      setMessage({
        type: "success",
        text: `${file.name} uploaded successfully!`,
      });

      // Clear message after 3s
      setTimeout(() => setMessage(null), 3000);
    };

    reader.onerror = () => {
      setUploading(false);
      setMessage({ type: "error", text: "Failed to read file" });
    };

    reader.readAsText(file);
    event.target.value = null; // Reset input
  };

  const handleSaveDocument = () => {
    if (!content.trim()) {
      setMessage({ type: "error", text: "Cannot save empty document" });
      return;
    }

    if (!filename.trim()) {
      setMessage({ type: "error", text: "Please enter a filename" });
      return;
    }

    setSaving(true);

    if (selectedDoc) {
      // Update existing document
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id
            ? {
                ...doc,
                content,
                name: filename,
                modifiedAt: new Date().toISOString(),
              }
            : doc
        )
      );
      setSelectedDoc((prev) => ({ ...prev, content, name: filename }));
      setMessage({ type: "success", text: "Document updated successfully!" });
    } else {
      // Create new document
      const newDoc = {
        id: Date.now().toString(),
        name: filename.endsWith(".txt") ? filename : `${filename}.txt`,
        content,
        size: new Blob([content]).size,
        uploadedAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };
      setDocuments((prev) => [...prev, newDoc]);
      setSelectedDoc(newDoc);
      setMessage({ type: "success", text: "Document saved successfully!" });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownloadDocument = (doc) => {
    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: "success", text: `Downloaded ${doc.name}` });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteDocument = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
      setContent("");
      setFilename("");
    }
    setMessage({ type: "success", text: "Document deleted" });
    setTimeout(() => setMessage(null), 3000);
    handleCloseMenu();
  };

  const handleSelectDocument = (doc) => {
    setSelectedDoc(doc);
    setContent(doc.content);
    setFilename(doc.name);
  };

  const handleNewDocument = () => {
    setSelectedDoc(null);
    setContent("");
    setFilename("untitled.txt");
  };

  const handleClearEditor = () => {
    setContent("");
  };

  const handleUploadToVectorDB = async () => {
    if (!currentConnection) {
      setMessage({ type: "error", text: "Please connect to a database first" });
      return;
    }

    if (!content.trim()) {
      setMessage({ type: "error", text: "Cannot upload empty document" });
      return;
    }

    setUploading(true);
    try {
      // Simulate API call to vector DB
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage({
        type: "success",
        text: "Document uploaded to vector database successfully!",
      });
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setUploading(false);
      setMessage({ type: "error", text: "Failed to upload to vector DB" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleOpenMenu = (event, docId) => {
    setAnchorEl(event.currentTarget);
    setMenuDocId(docId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuDocId(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left Panel - Document List */}
      <Box
        sx={{
          width: 320,
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fafafa",
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", bgcolor: "white" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            My Documents
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              size="small"
              fullWidth
              sx={{
                bgcolor: "#f59e0b",
                "&:hover": { bgcolor: "#d97706" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Upload
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleNewDocument}
              size="small"
              fullWidth
              sx={{
                borderColor: "#f59e0b",
                color: "#f59e0b",
                "&:hover": {
                  borderColor: "#d97706",
                  bgcolor: "#f59e0b10",
                },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              New
            </Button>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.doc,.docx"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </Box>

        {/* Document List */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {documents.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <FolderIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
              <Typography variant="body2">No documents yet</Typography>
              <Typography variant="caption">
                Upload or create a new document
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 1 }}>
              {documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => handleSelectDocument(doc)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    border: "1px solid transparent",
                    cursor: "pointer",
                    "&.Mui-selected": {
                      bgcolor: "#f59e0b15",
                      borderColor: "#f59e0b",
                    },
                    "&:hover": {
                      bgcolor: "#f59e0b08",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: "#f59e0b15",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <DocIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                  </Box>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                        noWrap
                      >
                        {doc.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(doc.size)} •{" "}
                        {formatDate(doc.modifiedAt)}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMenu(e, doc.id);
                      }}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Stats */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "white",
            display: "flex",
            gap: 2,
          }}
        >
          <Chip
            icon={<DocIcon />}
            label={`${documents.length} docs`}
            size="small"
            sx={{ bgcolor: "#f59e0b15", color: "#f59e0b", fontWeight: 600 }}
          />
          <Chip
            icon={<FolderIcon />}
            label={formatFileSize(
              documents.reduce((sum, doc) => sum + doc.size, 0)
            )}
            size="small"
            variant="outlined"
            sx={{ borderColor: "#e2e8f0" }}
          />
        </Box>
      </Box>

      {/* Right Panel - Editor */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Editor Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e2e8f0",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Document name..."
            size="small"
            sx={{
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#fafafa",
                fontWeight: 600,
              },
            }}
          />
          <Tooltip title="Save Document">
            <Button
              variant="contained"
              startIcon={saving ? null : <SaveIcon />}
              onClick={handleSaveDocument}
              disabled={saving}
              sx={{
                bgcolor: "#f59e0b",
                "&:hover": { bgcolor: "#d97706" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              onClick={() =>
                selectedDoc
                  ? handleDownloadDocument(selectedDoc)
                  : setMessage({ type: "error", text: "Save document first" })
              }
              disabled={!content.trim()}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Editor">
            <IconButton onClick={handleClearEditor} disabled={!content.trim()}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Message Alert */}
        {message && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(null)}
            sx={{ m: 2, mb: 0 }}
          >
            {message.text}
          </Alert>
        )}

        {/* Loading Progress */}
        {(uploading || saving) && (
          <LinearProgress sx={{ bgcolor: "#f59e0b15" }} />
        )}

        {/* Editor Area */}
        <Box sx={{ flexGrow: 1, p: 3, overflow: "auto", bgcolor: "#fafafa" }}>
          <Paper
            sx={{
              height: "100%",
              p: 3,
              border: "2px solid #e2e8f0",
              borderRadius: 2,
              transition: "border-color 0.2s",
              "&:focus-within": {
                borderColor: "#f59e0b",
              },
            }}
          >
            <TextField
              ref={textareaRef}
              multiline
              fullWidth
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing or upload a document to edit..."
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  fontFamily: "'Inter', sans-serif",
                  height: "100%",
                  alignItems: "flex-start",
                },
              }}
              sx={{
                height: "100%",
                "& .MuiInputBase-root": {
                  height: "100%",
                },
                "& textarea": {
                  height: "100% !important",
                  overflow: "auto !important",
                  resize: "none",
                  "&::-webkit-scrollbar": {
                    width: 8,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "#cbd5e0",
                    borderRadius: 4,
                  },
                },
              }}
            />
          </Paper>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip
              label={`${content.length} characters`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${content.split(/\s+/).filter(Boolean).length} words`}
              size="small"
              variant="outlined"
            />
          </Box>
          <Button
            variant="contained"
            startIcon={uploading ? null : <CloudIcon />}
            onClick={handleUploadToVectorDB}
            disabled={!content.trim() || uploading}
            sx={{
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {uploading ? "Uploading..." : "Upload to Vector DB"}
          </Button>
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            const doc = documents.find((d) => d.id === menuDocId);
            if (doc) handleDownloadDocument(doc);
            handleCloseMenu();
          }}
        >
          <DownloadIcon sx={{ mr: 1, fontSize: 18 }} />
          Download
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteDocument(menuDocId)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SelfLearningPage;
