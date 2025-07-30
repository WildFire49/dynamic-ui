// Sample API Response Variations for Backend-Driven Dynamic UI
// These examples show how your backend can send different response structures
// that the frontend can handle dynamically

import { createApiResponse, createErrorResponse, createFlowCompletionResponse } from './schema-utils';

/**
 * Sample API responses for different scenarios
 * Your backend can use these as templates
 */

// 1. Initial Welcome Screen Response
export const welcomeScreenResponse = {
  success: true,
  current_action: {
    action_id: "welcome",
    stage_name: "Welcome Screen",
    action_type: "WELCOME_SCREEN",
    priority: 1,
    is_mandatory: true,
    flow_type: "onboarding"
  },
  ui_schema: {
    id: "ui_welcome_screen_001",
    session_id: "session_12345",
    screen_id: "welcome_screen",
    ui_components: [
      {
        id: "welcome_container",
        component_type: "column",
        properties: {
          padding: "24dp",
          background_color: "#FFFFFF",
          vertical_arrangement: "center",
          horizontal_alignment: "center"
        },
        children: [
          {
            id: "welcome_text",
            component_type: "text",
            properties: {
              text: "Welcome to MiFix",
              text_size: "28sp",
              text_color: "#1976d2",
              text_style: "bold",
              text_align: "center",
              margin_bottom: "32dp"
            }
          },
          {
            id: "proceed_button",
            component_type: "button",
            properties: {
              text: "Get Started",
              background_color: "#1976d2",
              text_color: "#FFFFFF",
              text_size: "16sp",
              corner_radius: "8dp",
              padding: "16dp",
              action: {
                type: "navigate_to",
                action_id: "welcome",
                next_success_action_id: "video-consent"
              }
            }
          }
        ]
      }
    ]
  },
  navigation: {
    next_success_action_id: "video-consent",
    next_err_action_id: "welcome",
    can_skip: false
  },
  session_data: {
    session_id: "session_12345",
    user_id: null,
    flow_type: "onboarding",
    started_at: new Date().toISOString()
  }
};

// 2. Video Consent Screen Response
export const videoConsentResponse = {
  success: true,
  current_action: {
    action_id: "video-consent",
    stage_name: "Video Consent",
    action_type: "VIDEO_CONSENT_SCREEN",
    priority: 2,
    is_mandatory: true,
    flow_type: "onboarding",
    validation_required: true
  },
  ui_schema: {
    id: "ui_video_consent_001",
    session_id: "session_12345",
    screen_id: "video_consent_screen",
    ui_components: [
      {
        id: "consent_container",
        component_type: "column",
        properties: {
          padding: "24dp",
          background_color: "#F8F9FA"
        },
        children: [
          {
            id: "consent_title",
            component_type: "text",
            properties: {
              text: "Video Consent Required",
              text_size: "24sp",
              text_style: "bold",
              margin_bottom: "16dp"
            }
          },
          {
            id: "consent_video",
            component_type: "video",
            properties: {
              video_url: "https://example.com/consent-video.mp4",
              controls: true,
              autoplay: false,
              margin_bottom: "24dp"
            }
          },
          {
            id: "consent_checkbox",
            component_type: "checkbox",
            properties: {
              text: "I have watched the video and provide my consent",
              required: true,
              margin_bottom: "24dp"
            }
          },
          {
            id: "continue_button",
            component_type: "button",
            properties: {
              text: "Continue",
              background_color: "#4CAF50",
              text_color: "#FFFFFF",
              enabled: false,
              action: {
                type: "submit_form",
                endpoint: "/api/video-consent",
                method: "POST",
                action_id: "video-consent",
                next_success_action_id: "select-flow"
              }
            }
          }
        ]
      }
    ]
  },
  navigation: {
    next_success_action_id: "select-flow",
    next_err_action_id: "video-consent",
    can_skip: false
  },
  validation_rules: {
    consent_checkbox: {
      required: true,
      custom_error: "You must provide consent to continue"
    }
  }
};

// 3. Flow Selection Response with Conditional Navigation
export const flowSelectionResponse = {
  success: true,
  current_action: {
    action_id: "select-flow",
    stage_name: "Select Flow",
    action_type: "FLOW_SELECTION_SCREEN",
    priority: 3,
    is_mandatory: true,
    flow_type: "both"
  },
  ui_schema: {
    id: "ui_select_flow_001",
    session_id: "session_12345",
    screen_id: "select_flow_screen",
    ui_components: [
      {
        id: "flow_container",
        component_type: "column",
        properties: {
          padding: "24dp",
          vertical_arrangement: "center"
        },
        children: [
          {
            id: "flow_title",
            component_type: "text",
            properties: {
              text: "What would you like to do?",
              text_size: "24sp",
              text_style: "bold",
              text_align: "center",
              margin_bottom: "32dp"
            }
          },
          {
            id: "onboarding_button",
            component_type: "button",
            properties: {
              text: "New Customer Onboarding",
              background_color: "#1976d2",
              text_color: "#FFFFFF",
              margin_bottom: "16dp",
              action: {
                type: "submit_form",
                endpoint: "/api/select-flow",
                method: "POST",
                payload: { flow_choice: "onboarding" },
                action_id: "select-flow",
                next_success_action_id: "mobile-verification"
              }
            }
          },
          {
            id: "collections_button",
            component_type: "button",
            properties: {
              text: "Collections & Recovery",
              background_color: "#FF9800",
              text_color: "#FFFFFF",
              action: {
                type: "submit_form",
                endpoint: "/api/select-flow",
                method: "POST",
                payload: { flow_choice: "collections" },
                action_id: "select-flow",
                next_success_action_id: "customer-photo"
              }
            }
          }
        ]
      }
    ]
  },
  navigation: {
    next_success_action_id: "mobile-verification",
    next_err_action_id: "select-flow",
    conditional_next: {
      onboarding: "mobile-verification",
      collections: "customer-photo"
    },
    can_skip: false
  }
};

// 4. Mobile Verification Response
export const mobileVerificationResponse = {
  success: true,
  current_action: {
    action_id: "mobile-verification",
    stage_name: "Mobile Number Verification",
    action_type: "MOBILE_VERIFICATION_SCREEN",
    priority: 4,
    is_mandatory: true,
    flow_type: "onboarding",
    validation_required: true
  },
  ui_schema: {
    id: "ui_mobile_verification_001",
    session_id: "session_12345",
    screen_id: "mobile_verification_screen",
    ui_components: [
      {
        id: "mobile_container",
        component_type: "column",
        properties: {
          padding: "24dp"
        },
        children: [
          {
            id: "mobile_title",
            component_type: "text",
            properties: {
              text: "Mobile Verification",
              text_size: "24sp",
              text_style: "bold",
              margin_bottom: "16dp"
            }
          },
          {
            id: "mobile_input",
            component_type: "text_input",
            properties: {
              hint: "Enter 10-digit mobile number",
              input_type: "phone",
              max_length: 10,
              margin_bottom: "24dp",
              validation: {
                required: true,
                pattern: "^[0-9]{10}$",
                custom_error: "Please enter a valid 10-digit mobile number"
              }
            }
          },
          {
            id: "verify_button",
            component_type: "button",
            properties: {
              text: "Send OTP",
              background_color: "#4CAF50",
              text_color: "#FFFFFF",
              action: {
                type: "submit_form",
                endpoint: "/api/mobile-verification",
                method: "POST",
                collect_fields: ["mobile_input"],
                action_id: "mobile-verification",
                next_success_action_id: "otp-verification"
              }
            }
          }
        ]
      }
    ]
  },
  navigation: {
    next_success_action_id: "otp-verification",
    next_err_action_id: "mobile-verification",
    can_skip: false
  },
  validation_rules: {
    mobile_input: {
      required: true,
      pattern: "^[0-9]{10}$",
      custom_error: "Please enter a valid 10-digit mobile number"
    }
  }
};

// 5. Error Response Example
export const mobileVerificationErrorResponse = {
  success: false,
  error: "Invalid mobile number format",
  action_id: "mobile-verification",
  retry_action_id: "mobile-verification",
  error_details: {
    field: "mobile_input",
    validation_error: "Mobile number must be exactly 10 digits",
    user_input: "123456789" // Too short
  },
  ui_updates: {
    show_error: true,
    error_message: "Please enter a valid 10-digit mobile number",
    highlight_field: "mobile_input"
  },
  timestamp: new Date().toISOString()
};

// 6. Flow Completion Response
export const onboardingCompletionResponse = {
  success: true,
  flow_completed: true,
  flow_type: "onboarding",
  completion_data: {
    customer_id: "CUST_12345",
    application_id: "APP_67890",
    status: "APPROVED",
    credit_limit: 50000,
    next_steps: [
      "Document verification pending",
      "Account activation in 24 hours",
      "Welcome kit dispatch"
    ]
  },
  ui_schema: {
    id: "ui_success_screen_001",
    session_id: "session_12345",
    screen_id: "success_screen",
    ui_components: [
      {
        id: "success_container",
        component_type: "column",
        properties: {
          padding: "24dp",
          vertical_arrangement: "center",
          horizontal_alignment: "center"
        },
        children: [
          {
            id: "success_icon",
            component_type: "image",
            properties: {
              src: "/icons/success.png",
              width: "80dp",
              height: "80dp",
              margin_bottom: "24dp"
            }
          },
          {
            id: "success_title",
            component_type: "text",
            properties: {
              text: "Application Approved!",
              text_size: "24sp",
              text_style: "bold",
              text_color: "#4CAF50",
              text_align: "center",
              margin_bottom: "16dp"
            }
          },
          {
            id: "application_id",
            component_type: "text",
            properties: {
              text: "Application ID: APP_67890",
              text_size: "16sp",
              text_align: "center",
              margin_bottom: "32dp"
            }
          },
          {
            id: "dashboard_button",
            component_type: "button",
            properties: {
              text: "Go to Dashboard",
              background_color: "#1976d2",
              text_color: "#FFFFFF",
              action: {
                type: "navigate_to",
                route: "/dashboard"
              }
            }
          }
        ]
      }
    ]
  },
  timestamp: new Date().toISOString()
};

// 7. Dynamic Configuration Response (Backend can modify flow on-the-fly)
export const dynamicConfigResponse = {
  success: true,
  config_update: true,
  updated_actions: [
    {
      action_id: "mobile-verification",
      modifications: {
        is_mandatory: false, // Made optional
        skip_conditions: ["existing_customer"],
        alternative_next: "customer-photo"
      }
    }
  ],
  flow_modifications: {
    skip_video_consent: false,
    enable_fast_track: true,
    additional_validations: ["credit_check"]
  },
  current_action: createApiResponse("mobile-verification", {
    flow_modifications: true,
    skip_available: true
  })
};

// Utility function to generate responses dynamically
export const generateResponseForAction = (actionId, customData = {}) => {
  return createApiResponse(actionId, {
    session_data: {
      session_id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...customData
    }
  });
};

export default {
  welcomeScreenResponse,
  videoConsentResponse,
  flowSelectionResponse,
  mobileVerificationResponse,
  mobileVerificationErrorResponse,
  onboardingCompletionResponse,
  dynamicConfigResponse,
  generateResponseForAction
};
