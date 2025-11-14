import { useCallback } from "react";
import workflowService from "../services/workflowService";

/**
 * Custom hook for handling workflow form submissions
 * @param {Object} params - Hook parameters
 * @param {Object} params.workflowState - Current workflow state
 * @param {Function} params.setWorkflowState - Set workflow state function
 * @param {string} params.currentWorkflowAction - Current workflow action
 * @param {Function} params.setCurrentWorkflowAction - Set workflow action function
 * @param {Function} params.setChatHistory - Set chat history function
 * @param {Function} params.setIsTyping - Set typing indicator function
 * @param {Function} params.getUserId - Get user ID function
 * @param {string} params.currentUserId - Current user ID
 * @returns {Object} Workflow handlers
 */
export const useWorkflowHandler = ({
  workflowState,
  setWorkflowState,
  setChatHistory,
  setIsTyping,
  getUserId,
  currentUserId,
}) => {
  /**
   * Handle workflow form submission
   * Extracts form data, builds API payload, and processes response
   */
  const handleWorkflowFormSubmit = useCallback(
    async (formData, formSchema) => {
      setIsTyping(true);

      try {
        // Build payload based on current workflow state
        const payload = {
          user_id: currentUserId || getUserId(),
          category: workflowState.category || "",
          selected_product: workflowState.selected_product || "",
          application_id: workflowState.application_id || "",
          input: {},
        };

        // Extract values from form data based on field IDs
        const sections = formSchema.sections || [];
        sections.forEach((section) => {
          section.fields?.forEach((field) => {
            if (formData[field.id] !== undefined) {
              // Map special workflow fields to top-level payload
              if (field.id === "select_category") {
                payload.category = formData[field.id];
              } else if (field.id === "select_product") {
                payload.selected_product = formData[field.id];
              } else {
                // All other fields go into input object
                payload.input[field.id] = formData[field.id];
              }
            }
          });
        });

        // Use nextAction from workflow state (set by previous API response)
        // This ensures we use the action specified by the API, not the button label
        const actionToExecute =
          workflowState.nextAction ||
          formSchema.submitButton?.action ||
          "submit";

        console.log("🔄 Workflow submission:", {
          action: actionToExecute,
          storedNextAction: workflowState.nextAction,
          buttonAction: formSchema.submitButton?.action,
          workflowState: workflowState,
          payload,
          formSchema: formSchema.id,
        });

        console.log("📊 Current workflow state before submission:", {
          category: workflowState.category,
          selected_product: workflowState.selected_product,
          application_id: workflowState.application_id,
          nextAction: workflowState.nextAction,
        });

        // Call workflow API
        const response = await workflowService.executeAction(
          actionToExecute,
          payload
        );

        if (response.success && response.data?.ui_schema) {
          // Update workflow state with nextAction and application_id from API response
          const apiNextAction = response.data.nextAction || "";
          const apiApplicationId =
            response.data.application_id || workflowState.application_id || "";

          console.log("✅ Form submission response:", {
            previousNextAction: workflowState.nextAction,
            newNextAction: apiNextAction,
            previousApplicationId: workflowState.application_id,
            newApplicationId: apiApplicationId,
            updatedCategory: payload.category,
            updatedProduct: payload.selected_product,
            inputData: payload.input,
            fullResponseData: response.data,
          });

          // Warn if application_id is missing
          if (!apiApplicationId && payload.selected_product) {
            console.warn(
              "⚠️ APPLICATION_ID IS MISSING! Product is selected but no application_id received or stored."
            );
          }

          const newState = {
            category: payload.category || workflowState.category,
            selected_product:
              payload.selected_product || workflowState.selected_product,
            application_id: apiApplicationId, // Store application_id from API
            nextAction: apiNextAction, // Dynamically set from API
          };

          console.log("💾 Updating workflow state to:", newState);
          setWorkflowState(newState);

          // Extract next form from response
          const forms = response.data.ui_schema.forms;
          if (forms && forms.length > 0) {
            const workflowMessage = {
              type: "workflow_form",
              formSchema: forms[0].schema,
              workflowData: response.data,
              isBot: true,
              timestamp: new Date().toISOString(),
            };
            setChatHistory((prev) => [...prev, workflowMessage]);
          }
        }
      } catch (error) {
        console.error("Workflow submission error:", error);
        const errorMessage = {
          type: "user",
          content: { text: `❌ Workflow submission failed: ${error.message}` },
          isBot: true,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [
      workflowState,
      setWorkflowState,
      setChatHistory,
      setIsTyping,
      currentUserId,
      getUserId,
    ]
  );

  /**
   * Handle workflow text message (e.g., "Hi")
   * Sends message to workflow API and displays response
   */
  const handleWorkflowMessage = useCallback(
    async (message) => {
      setIsTyping(true);
      try {
        // Build payload with current workflow state
        const payload = {
          user_id: currentUserId || getUserId(),
          category: workflowState.category || "",
          selected_product: workflowState.selected_product || "",
          application_id: workflowState.application_id || "",
          input: {},
        };

        // Use the message as action (e.g., "Hi")
        console.log("🚀 Sending workflow message:", {
          action: message,
          currentState: workflowState,
        });

        const response = await workflowService.executeAction(message, payload);

        if (response.success && response.data?.ui_schema) {
          // Update workflow state with nextAction and application_id from API response
          const apiNextAction = response.data.nextAction || "";
          const apiApplicationId =
            response.data.application_id || payload.application_id || "";

          console.log("✅ Workflow response received:", {
            nextAction: apiNextAction,
            applicationId: apiApplicationId,
            formsReceived: response.data.ui_schema.forms?.length || 0,
          });

          setWorkflowState({
            category: payload.category,
            selected_product: payload.selected_product,
            application_id: apiApplicationId, // Store application_id from API
            nextAction: apiNextAction, // Dynamically set from API
          });

          // Extract form from response
          const forms = response.data.ui_schema.forms;
          if (forms && forms.length > 0) {
            const workflowMessage = {
              type: "workflow_form",
              formSchema: forms[0].schema,
              workflowData: response.data,
              isBot: true,
              timestamp: new Date().toISOString(),
            };
            setChatHistory((prev) => [...prev, workflowMessage]);
          }
        }
        return { success: true };
      } catch (error) {
        console.error("Workflow message error:", error);
        const errorMessage = {
          type: "user",
          content: { text: `❌ Workflow request failed: ${error.message}` },
          isBot: true,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, errorMessage]);
        return { success: false, error };
      } finally {
        setIsTyping(false);
      }
    },
    [
      currentUserId,
      getUserId,
      setChatHistory,
      setIsTyping,
      workflowState,
      setWorkflowState,
    ]
  );

  /**
   * Reset workflow state
   */
  const resetWorkflow = useCallback(() => {
    setWorkflowState({
      category: "",
      selected_product: "",
      application_id: "",
      nextAction: "", // Empty - will be set from user input or API response
    });
  }, [setWorkflowState]);

  return {
    handleWorkflowFormSubmit,
    handleWorkflowMessage,
    resetWorkflow,
  };
};
