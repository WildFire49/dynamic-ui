// Complete Onboarding Flow Example with Mock API Responses
// This demonstrates the exact JSON flow when a user says "I want to onboard a new customer"

/**
 * SCENARIO: User wants to onboard a new customer
 * FLOW: Welcome → Video Consent → Select Flow → Mobile Verification → OTP → Customer Photo → Success
 * 
 * Each step shows:
 * 1. What the frontend sends to backend
 * 2. What the backend responds with
 * 3. How the UI renders based on the response
 */

// =============================================================================
// STEP 1: Initial App Load - Show Welcome Screen
// =============================================================================

/**
 * When the app first loads, it requests the initial screen
 * Frontend makes this API call:
 */
export const initialLoadRequest = {
  method: "GET",
  url: "/api/get-initial-screen",
  headers: {
    "Content-Type": "application/json"
  },
  // No body needed for initial load
};

/**
 * Backend responds with Welcome Screen configuration
 * This tells the frontend to show the welcome screen with a "Get Started" button
 */
export const step1_WelcomeScreenResponse = {
  // Success indicator
  success: true,
  
  // Current action metadata
  current_action: {
    action_id: "welcome",
    stage_name: "Welcome Screen", 
    action_type: "WELCOME_SCREEN",
    priority: 1,
    is_mandatory: true,
    flow_type: "onboarding",
    description: "Initial welcome screen for new customer onboarding"
  },
  
  // Complete UI schema - tells frontend exactly what to render
  ui_schema: {
    id: "ui_welcome_screen_001",
    session_id: "session_12345",
    screen_id: "welcome_screen",
    ui_components: [
      {
        id: "welcome_container",
        component_type: "column", // Vertical layout
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
              text: "Welcome to MiFix Customer Onboarding",
              text_size: "28sp",
              text_color: "#1976d2",
              text_style: "bold",
              text_align: "center",
              margin_bottom: "16dp"
            }
          },
          {
            id: "subtitle_text", 
            component_type: "text",
            properties: {
              text: "Let's get you started with a quick onboarding process",
              text_size: "16sp",
              text_color: "#666666",
              text_align: "center",
              margin_bottom: "32dp"
            }
          },
          {
            id: "get_started_button",
            component_type: "button",
            properties: {
              text: "Get Started",
              background_color: "#1976d2",
              text_color: "#FFFFFF",
              text_size: "16sp",
              corner_radius: "8dp",
              padding: "16dp",
              // This action tells frontend what to do when button is clicked
              action: {
                type: "navigate_to", // Action type
                action_id: "welcome", // Current action
                next_success_action_id: "video-consent" // Where to go next
              }
            }
          }
        ]
      }
    ]
  },
  
  // Navigation rules
  navigation: {
    next_success_action_id: "video-consent", // Next step on success
    next_err_action_id: "welcome", // Stay here on error
    can_skip: false // Cannot skip welcome screen
  },
  
  // Session tracking data
  session_data: {
    session_id: "session_12345",
    user_id: null, // No user yet
    flow_type: "onboarding",
    started_at: "2025-07-29T08:19:39.000Z",
    current_step: 1,
    total_steps: 7
  }
};

// =============================================================================
// STEP 2: User Clicks "Get Started" - Request Video Consent Screen
// =============================================================================

/**
 * When user clicks "Get Started", frontend sends this request to backend
 */
export const step2_GetVideoConsentRequest = {
  method: "POST",
  url: "/api/navigate-to-action",
  headers: {
    "Content-Type": "application/json",
    "Session-ID": "session_12345"
  },
  body: {
    current_action_id: "welcome",
    requested_action_id: "video-consent",
    action_type: "navigate_to",
    user_data: {
      // Any data collected from welcome screen (none in this case)
    }
  }
};

/**
 * Backend responds with Video Consent Screen configuration
 * This screen requires user to watch a video and provide consent
 */
export const step2_VideoConsentResponse = {
  success: true,
  
  current_action: {
    action_id: "video-consent",
    stage_name: "Video Consent",
    action_type: "VIDEO_CONSENT_SCREEN", 
    priority: 2,
    is_mandatory: true,
    flow_type: "onboarding",
    validation_required: true, // This screen requires validation
    description: "User must watch consent video and agree to terms"
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
              text_color: "#333333",
              margin_bottom: "16dp"
            }
          },
          {
            id: "consent_description",
            component_type: "text", 
            properties: {
              text: "Please watch this important video about our terms and conditions",
              text_size: "16sp",
              text_color: "#666666",
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
              width: "100%",
              height: "200dp",
              margin_bottom: "24dp"
            }
          },
          {
            id: "consent_checkbox",
            component_type: "checkbox",
            properties: {
              text: "I have watched the video and provide my consent to proceed",
              required: true,
              margin_bottom: "24dp",
              // Form field name for data collection
              field_name: "video_consent_agreed"
            }
          },
          {
            id: "continue_button",
            component_type: "button",
            properties: {
              text: "Continue",
              background_color: "#4CAF50",
              text_color: "#FFFFFF",
              enabled: false, // Disabled until checkbox is checked
              action: {
                type: "submit_form", // This will collect form data and submit
                endpoint: "/api/submit-video-consent",
                method: "POST",
                action_id: "video-consent",
                next_success_action_id: "select-flow",
                // Fields to collect from this screen
                collect_fields: ["consent_checkbox"]
              }
            }
          }
        ]
      }
    ]
  },
  
  navigation: {
    next_success_action_id: "select-flow",
    next_err_action_id: "video-consent", // Stay here if validation fails
    can_skip: false
  },
  
  // Validation rules for this screen
  validation_rules: {
    consent_checkbox: {
      required: true,
      custom_error: "You must provide consent to continue with onboarding"
    }
  },
  
  session_data: {
    session_id: "session_12345",
    flow_type: "onboarding", 
    current_step: 2,
    total_steps: 7
  }
};

// =============================================================================
// STEP 3: User Watches Video and Checks Consent - Submit Form
// =============================================================================

/**
 * When user checks the consent checkbox and clicks Continue, frontend sends:
 */
export const step3_SubmitVideoConsentRequest = {
  method: "POST",
  url: "/api/submit-video-consent",
  headers: {
    "Content-Type": "application/json",
    "Session-ID": "session_12345"
  },
  body: {
    current_action_id: "video-consent",
    action_type: "submit_form",
    form_data: {
      video_consent_agreed: true, // User checked the checkbox
      video_watched: true, // Could track if video was actually played
      consent_timestamp: "2025-07-29T08:22:15.000Z"
    },
    next_success_action_id: "select-flow"
  }
};

/**
 * Backend validates the consent and responds with Flow Selection Screen
 * This screen lets user choose between onboarding or collections flow
 */
export const step3_FlowSelectionResponse = {
  success: true,
  
  current_action: {
    action_id: "select-flow",
    stage_name: "Select Flow Type",
    action_type: "FLOW_SELECTION_SCREEN",
    priority: 3,
    is_mandatory: true,
    flow_type: "both", // This action supports both flow types
    description: "User selects between onboarding or collections flow"
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
          vertical_arrangement: "center",
          horizontal_alignment: "center"
        },
        children: [
          {
            id: "flow_title",
            component_type: "text",
            properties: {
              text: "What would you like to do today?",
              text_size: "24sp",
              text_style: "bold",
              text_align: "center",
              margin_bottom: "16dp"
            }
          },
          {
            id: "flow_subtitle",
            component_type: "text",
            properties: {
              text: "Choose the appropriate flow for your needs",
              text_size: "16sp",
              text_color: "#666666",
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
              text_size: "16sp",
              padding: "16dp",
              margin_bottom: "16dp",
              action: {
                type: "submit_form",
                endpoint: "/api/select-flow",
                method: "POST",
                payload: { 
                  flow_choice: "onboarding" // This determines next step
                },
                action_id: "select-flow",
                next_success_action_id: "mobile-verification" // Goes to mobile verification for onboarding
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
              text_size: "16sp",
              padding: "16dp",
              action: {
                type: "submit_form",
                endpoint: "/api/select-flow",
                method: "POST",
                payload: { 
                  flow_choice: "collections" 
                },
                action_id: "select-flow",
                next_success_action_id: "customer-photo" // Goes directly to photo for collections
              }
            }
          }
        ]
      }
    ]
  },
  
  navigation: {
    next_success_action_id: "mobile-verification", // Default next step
    next_err_action_id: "select-flow",
    // Conditional navigation based on user choice
    conditional_next: {
      onboarding: "mobile-verification", // If user selects onboarding
      collections: "customer-photo" // If user selects collections
    },
    can_skip: false
  },
  
  session_data: {
    session_id: "session_12345",
    flow_type: "both", // Will be updated based on user selection
    current_step: 3,
    total_steps: 7,
    // Store previous step data
    previous_steps: {
      welcome: { completed: true },
      video_consent: { 
        completed: true, 
        consent_given: true,
        timestamp: "2025-07-29T08:22:15.000Z"
      }
    }
  }
};

// =============================================================================
// STEP 4: User Selects "New Customer Onboarding" - Request Mobile Verification
// =============================================================================

/**
 * User clicks "New Customer Onboarding" button, frontend sends:
 */
export const step4_SelectOnboardingFlowRequest = {
  method: "POST", 
  url: "/api/select-flow",
  headers: {
    "Content-Type": "application/json",
    "Session-ID": "session_12345"
  },
  body: {
    current_action_id: "select-flow",
    action_type: "submit_form",
    form_data: {
      flow_choice: "onboarding" // User's selection
    },
    next_success_action_id: "mobile-verification"
  }
};

/**
 * Backend responds with Mobile Verification Screen
 * This screen collects and verifies user's mobile number
 */
export const step4_MobileVerificationResponse = {
  success: true,
  
  current_action: {
    action_id: "mobile-verification",
    stage_name: "Mobile Number Verification", 
    action_type: "MOBILE_VERIFICATION_SCREEN",
    priority: 4,
    is_mandatory: true,
    flow_type: "onboarding", // Now locked to onboarding flow
    validation_required: true,
    description: "Collect and verify customer's mobile number"
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
              text: "Mobile Number Verification",
              text_size: "24sp",
              text_style: "bold",
              margin_bottom: "16dp"
            }
          },
          {
            id: "mobile_description",
            component_type: "text",
            properties: {
              text: "We'll send you an OTP to verify your mobile number",
              text_size: "16sp",
              text_color: "#666666",
              margin_bottom: "24dp"
            }
          },
          {
            id: "mobile_input",
            component_type: "text_input",
            properties: {
              hint: "Enter your 10-digit mobile number",
              input_type: "phone",
              max_length: 10,
              margin_bottom: "24dp",
              field_name: "mobile_number", // Form field name
              validation: {
                required: true,
                pattern: "^[0-9]{10}$",
                custom_error: "Please enter a valid 10-digit mobile number"
              }
            }
          },
          {
            id: "send_otp_button",
            component_type: "button",
            properties: {
              text: "Send OTP",
              background_color: "#4CAF50",
              text_color: "#FFFFFF",
              action: {
                type: "submit_form",
                endpoint: "/api/send-mobile-otp",
                method: "POST",
                collect_fields: ["mobile_input"], // Collect mobile number
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
    next_err_action_id: "mobile-verification", // Stay here if mobile number is invalid
    can_skip: false
  },
  
  validation_rules: {
    mobile_input: {
      required: true,
      pattern: "^[0-9]{10}$", // Exactly 10 digits
      custom_error: "Please enter a valid 10-digit mobile number"
    }
  },
  
  session_data: {
    session_id: "session_12345",
    flow_type: "onboarding", // Now confirmed as onboarding
    current_step: 4,
    total_steps: 7,
    previous_steps: {
      welcome: { completed: true },
      video_consent: { completed: true, consent_given: true },
      select_flow: { completed: true, flow_choice: "onboarding" }
    }
  }
};

// =============================================================================
// STEP 5: User Enters Mobile Number - Send OTP
// =============================================================================

/**
 * User enters mobile number and clicks "Send OTP", frontend sends:
 */
export const step5_SendOTPRequest = {
  method: "POST",
  url: "/api/send-mobile-otp", 
  headers: {
    "Content-Type": "application/json",
    "Session-ID": "session_12345"
  },
  body: {
    current_action_id: "mobile-verification",
    action_type: "submit_form",
    form_data: {
      mobile_number: "9876543210" // User entered mobile number
    },
    next_success_action_id: "otp-verification"
  }
};

/**
 * Backend sends OTP to mobile number and responds with OTP Verification Screen
 */
export const step5_OTPVerificationResponse = {
  success: true,
  
  // Backend confirms OTP was sent
  otp_sent: true,
  otp_reference: "OTP_REF_12345",
  
  current_action: {
    action_id: "otp-verification",
    stage_name: "OTP Verification",
    action_type: "OTP_VERIFICATION_SCREEN",
    priority: 5,
    is_mandatory: true,
    flow_type: "onboarding",
    validation_required: true,
    description: "Verify OTP sent to mobile number"
  },
  
  ui_schema: {
    id: "ui_otp_verification_001", 
    session_id: "session_12345",
    screen_id: "otp_verification_screen",
    ui_components: [
      {
        id: "otp_container",
        component_type: "column",
        properties: {
          padding: "24dp"
        },
        children: [
          {
            id: "otp_title",
            component_type: "text",
            properties: {
              text: "Enter OTP",
              text_size: "24sp",
              text_style: "bold",
              margin_bottom: "16dp"
            }
          },
          {
            id: "otp_description",
            component_type: "text",
            properties: {
              text: "We've sent a 6-digit OTP to +91-9876543210",
              text_size: "16sp", 
              text_color: "#666666",
              margin_bottom: "24dp"
            }
          },
          {
            id: "otp_input",
            component_type: "text_input",
            properties: {
              hint: "Enter 6-digit OTP",
              input_type: "number",
              max_length: 6,
              margin_bottom: "16dp",
              field_name: "otp_code",
              validation: {
                required: true,
                pattern: "^[0-9]{6}$",
                custom_error: "Please enter the 6-digit OTP"
              }
            }
          },
          {
            id: "resend_otp_text",
            component_type: "text",
            properties: {
              text: "Didn't receive OTP? Resend in 30 seconds",
              text_size: "14sp",
              text_color: "#999999",
              text_align: "center",
              margin_bottom: "24dp"
            }
          },
          {
            id: "verify_otp_button",
            component_type: "button", 
            properties: {
              text: "Verify OTP",
              background_color: "#4CAF50",
              text_color: "#FFFFFF",
              action: {
                type: "submit_form",
                endpoint: "/api/verify-otp",
                method: "POST",
                collect_fields: ["otp_input"],
                action_id: "otp-verification",
                next_success_action_id: "customer-photo"
              }
            }
          }
        ]
      }
    ]
  },
  
  navigation: {
    next_success_action_id: "customer-photo",
    next_err_action_id: "otp-verification", // Stay here if OTP is wrong
    can_skip: false
  },
  
  validation_rules: {
    otp_input: {
      required: true,
      pattern: "^[0-9]{6}$",
      custom_error: "Please enter the 6-digit OTP sent to your mobile"
    }
  },
  
  session_data: {
    session_id: "session_12345",
    flow_type: "onboarding",
    current_step: 5,
    total_steps: 7,
    mobile_number: "9876543210", // Store verified mobile number
    otp_reference: "OTP_REF_12345"
  }
};

// =============================================================================
// EXAMPLE ERROR RESPONSE: Wrong OTP Entered
// =============================================================================

/**
 * If user enters wrong OTP, backend responds with error:
 */
export const step5_WrongOTPErrorResponse = {
  success: false,
  error: "Invalid OTP entered",
  action_id: "otp-verification",
  retry_action_id: "otp-verification", // Stay on same screen
  
  error_details: {
    field: "otp_input",
    validation_error: "The OTP you entered is incorrect",
    user_input: "123456", // What user entered
    attempts_remaining: 2 // How many attempts left
  },
  
  // UI updates to show error
  ui_updates: {
    show_error: true,
    error_message: "Incorrect OTP. Please try again. 2 attempts remaining.",
    highlight_field: "otp_input",
    clear_field: "otp_input" // Clear the input field
  },
  
  timestamp: "2025-07-29T08:25:30.000Z"
};

// =============================================================================
// FINAL STEP: Complete Flow Example
// =============================================================================

/**
 * When user enters correct OTP and verification succeeds:
 */
export const finalStep_OnboardingSuccessResponse = {
  success: true,
  flow_completed: true,
  flow_type: "onboarding",
  
  completion_data: {
    customer_id: "CUST_12345",
    mobile_number: "9876543210",
    mobile_verified: true,
    video_consent_given: true,
    onboarding_completed_at: "2025-07-29T08:26:45.000Z",
    next_steps: [
      "Customer photo capture",
      "Document upload", 
      "Final verification"
    ]
  },
  
  // Success screen UI
  ui_schema: {
    id: "ui_success_screen_001",
    session_id: "session_12345",
    screen_id: "onboarding_success_screen",
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
            id: "success_title",
            component_type: "text",
            properties: {
              text: "Onboarding Successful!",
              text_size: "24sp",
              text_style: "bold",
              text_color: "#4CAF50",
              text_align: "center",
              margin_bottom: "16dp"
            }
          },
          {
            id: "customer_id_text",
            component_type: "text",
            properties: {
              text: "Customer ID: CUST_12345",
              text_size: "16sp",
              text_align: "center",
              margin_bottom: "32dp"
            }
          },
          {
            id: "continue_button",
            component_type: "button",
            properties: {
              text: "Continue to Photo Capture",
              background_color: "#1976d2",
              text_color: "#FFFFFF",
              action: {
                type: "navigate_to",
                action_id: "onboarding-success",
                next_success_action_id: "customer-photo"
              }
            }
          }
        ]
      }
    ]
  }
};

export default {
  // Complete flow in order
  step1_WelcomeScreenResponse,
  step2_VideoConsentResponse, 
  step3_FlowSelectionResponse,
  step4_MobileVerificationResponse,
  step5_OTPVerificationResponse,
  finalStep_OnboardingSuccessResponse,
  
  // Error examples
  step5_WrongOTPErrorResponse,
  
  // Request examples
  initialLoadRequest,
  step2_GetVideoConsentRequest,
  step3_SubmitVideoConsentRequest,
  step4_SelectOnboardingFlowRequest,
  step5_SendOTPRequest
};
