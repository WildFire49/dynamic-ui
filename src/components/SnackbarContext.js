"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Snackbar, Alert } from "@mui/material";
import notificationManager from "@/utils/notificationManager";

const SnackbarContext = createContext();

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'success' | 'error' | 'warning' | 'info'
    duration: 3000,
  });

  const showSnackbar = useCallback(
    (message, severity = "info", duration = 3000) => {
      setSnackbar({
        open: true,
        message,
        severity,
        duration,
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message, duration = 3000) => {
      showSnackbar(message, "success", duration);
    },
    [showSnackbar]
  );

  const showError = useCallback(
    (message, duration = 3000) => {
      showSnackbar(message, "error", duration);
    },
    [showSnackbar]
  );

  const showWarning = useCallback(
    (message, duration = 3000) => {
      showSnackbar(message, "warning", duration);
    },
    [showSnackbar]
  );

  const showInfo = useCallback(
    (message, duration = 3000) => {
      showSnackbar(message, "info", duration);
    },
    [showSnackbar]
  );

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(
      ({ message, severity, duration }) => {
        showSnackbar(message, severity, duration);
      }
    );
    return unsubscribe;
  }, [showSnackbar]);

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }} // Add margin-top to avoid overlapping with header
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
            minWidth: "300px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#fff",
            "& .MuiAlert-icon": {
              color: "#fff",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
