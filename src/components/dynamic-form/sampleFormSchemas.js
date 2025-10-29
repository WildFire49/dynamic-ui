// Sample form schemas for different use cases

// API-enabled schema example
export const apiEnabledCustomerSchema = {
  id: "api_customer_onboarding",
  title: "Customer Onboarding (API Enabled)",
  description: "Form with API integration for dynamic data",

  // Global API configuration
  apiConfig: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  },

  // Form submission API
  submitApi: {
    endpoint: "/api/customers/onboard",
    method: "POST",
    onSuccess: {
      action: "navigate",
      path: "/success",
      message: "Customer onboarded successfully!",
    },
    onError: {
      action: "showMessage",
      message: "Failed to submit. Please try again.",
    },
  },

  sections: [
    {
      id: "location_api_section",
      title: "Location Details (API Driven)",
      subtitle: "Select your location",
      icon: "home",
      fields: [
        {
          id: "state",
          type: "dropdown",
          label: "State",
          placeholder: "Select state",
          required: true,
          // API configuration for loading states
          api: {
            endpoint: "/api/locations/states",
            method: "GET",
            responseMapping: {
              value: "stateCode",
              label: "stateName",
              dataPath: "data.states",
            },
            cache: {
              enabled: true,
              duration: 3600000,
            },
            loadingText: "Loading states...",
            errorText: "Failed to load states",
          },
          // Fallback options
          options: [
            { value: "KA", label: "Karnataka" },
            { value: "MH", label: "Maharashtra" },
          ],
        },
        {
          id: "district",
          type: "dropdown",
          label: "District",
          placeholder: "Select district",
          required: true,
          enabledIf: {
            field: "state",
            hasValue: true,
          },
          // Dependent API call
          api: {
            endpoint: "/api/locations/districts",
            method: "GET",
            params: {
              stateCode: "${state}",
            },
            triggerOn: {
              field: "state",
              onChange: true,
            },
            responseMapping: {
              value: "districtCode",
              label: "districtName",
              dataPath: "data.districts",
            },
          },
          options: [],
        },
        {
          id: "verify_location",
          type: "button",
          label: "Verify Location",
          buttonLabel: "Verify Now",
          variant: "outlined",
          icon: "home",
          // API action on button click
          api: {
            endpoint: "/api/locations/verify",
            method: "POST",
            body: {
              state: "${state}",
              district: "${district}",
            },
            onSuccess: {
              action: "updateFields",
              fields: {
                location_verified: "true",
                verification_status: "response.data.status",
              },
              message: "Location verified successfully!",
            },
            onError: {
              action: "showMessage",
              message: "Verification failed. Please try again.",
            },
            loadingText: "Verifying...",
          },
        },
      ],
    },
    {
      id: "kyc_api_section",
      title: "KYC Verification (API)",
      subtitle: "Verify your identity",
      icon: "fingerprint",
      fields: [
        {
          id: "aadhaar_number",
          type: "text",
          label: "Aadhaar Number",
          placeholder: "Enter 12 digit Aadhaar",
          required: true,
          validation: {
            pattern: "^\\d{12}$",
            message: "Enter valid 12 digit Aadhaar",
          },
          // API validation
          apiValidation: {
            endpoint: "/api/validate/aadhaar",
            method: "POST",
            body: {
              aadhaar: "${aadhaar_number}",
            },
            debounce: 1000,
            onSuccess: {
              isValid: "response.data.isValid",
              message: "response.data.message",
            },
          },
        },
        {
          id: "verify_kyc",
          type: "button",
          buttonLabel: "Verify KYC",
          variant: "contained",
          icon: "fingerprint",
          api: {
            endpoint: "/api/kyc/verify",
            method: "POST",
            body: {
              aadhaarNumber: "${aadhaar_number}",
            },
            onSuccess: {
              action: "updateFields",
              fields: {
                full_name: "response.data.name",
                date_of_birth: "response.data.dob",
                gender: "response.data.gender",
              },
              message: "KYC verified successfully!",
            },
            loadingText: "Verifying KYC...",
          },
        },
      ],
    },
  ],

  submitButton: {
    label: "Submit Application",
    action: "submit",
  },
};

export const KVBCustomerOnboardingSchema = {
  title: "KVB Agriculture Instant KCC",
  description: "Please fill in your details to complete the onboarding process",
  sections: [
    {
      id: "aadhaar_section",
      title: "Aadhaar Verification",
      subtitle: "Verify your identity",
      icon: "fingerprint",
      fields: [
        {
          id: "aadhaar_number",
          type: "text",
          label: "Aadhaar Number",
          placeholder: "Enter your 12 digit Aadhaar number",
          required: true,
          icon: "fingerprint",
          validation: {
            pattern: "^\\d{12}$",
            message: "Aadhaar number must be exactly 12 digits",
          },
        },
        {
          id: "biometric_scan",
          type: "biometric",
          label: "Tap to scan",
          required: false,
        },
        {
          id: "kyc_consent",
          type: "checkbox",
          label:
            "I hereby state that I have no objection for KVB Bank validating and fetching my e-KYC details from UIDAI through the KVB Bank e-KYC system and consent to provide my Aadhar number, biometric for Aadhar based KYC. Also I give consent to store my eKYC details for the purpose of KYC verification process with KVB Bank.",
          required: true,
          validation: {
            message: "You must accept the terms to continue",
          },
        },
      ],
    },
    {
      id: "applicant_details",
      title: "Applicant Details",
      subtitle: "Personal information",
      icon: "person",
      fields: [
        {
          id: "full_name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
          icon: "person",
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
          validation: {
            minLength: 3,
            message: "Full name must be at least 3 characters",
          },
        },
        {
          id: "date_of_birth",
          type: "date",
          label: "Date Of Birth",
          required: true,
          icon: "calendar",
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
          validation: {
            maxDate: "2006-01-01",
            message: "Date of birth must be before 2006",
          },
        },
        {
          id: "gender",
          type: "radio",
          label: "Gender",
          required: true,
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
          validation: {
            message: "Please select a gender",
          },
          options: [
            { value: "male", label: "Male", icon: "male" },
            { value: "female", label: "Female", icon: "female" },
            { value: "transgender", label: "Transgender", icon: "transgender" },
          ],
        },
        {
          id: "care_of",
          type: "text",
          label: "C/O",
          placeholder: "Care of",
          required: false,
          icon: "home",
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
        },
        {
          id: "father_name",
          type: "text",
          label: "Father Name",
          placeholder: "Enter father's name",
          required: true,
          icon: "person",
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
        },
        {
          id: "mother_name",
          type: "text",
          label: "Mother Name",
          placeholder: "Enter mother's name",
          required: true,
          icon: "person",
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
        },
        {
          id: "pan_card_image",
          type: "image_capture",
          label: "PAN Card",
          placeholder: "Capture or upload your PAN card",
          required: true,
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
          validation: {
            message: "PAN card image is required",
          },
        },
        {
          id: "customer_photo",
          type: "image_capture",
          label: "Customer Photo",
          placeholder: "Capture or upload your photo",
          required: true,
          enabledIf: {
            field: "kyc_consent",
            equals: true,
          },
          validation: {
            message: "Customer photo is required",
          },
        },
      ],
    },
    {
      id: "additional_details",
      title: "Additional Information",
      subtitle: "Complete your profile",
      icon: "person",
      fields: [
        {
          id: "ethnicity",
          type: "dropdown",
          label: "Ethnicity",
          placeholder: "Select ethnicity",
          required: true,
          options: [
            { value: "hindu", label: "Hindu" },
            { value: "muslim", label: "Muslim" },
            { value: "christian", label: "Christian" },
            { value: "sikh", label: "Sikh" },
            { value: "buddhist", label: "Buddhist" },
            { value: "jain", label: "Jain" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "community",
          type: "dropdown",
          label: "Community",
          placeholder: "Select community",
          required: true,
          options: [
            { value: "general", label: "General" },
            { value: "obc", label: "OBC" },
            { value: "sc", label: "SC" },
            { value: "st", label: "ST" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "marital_status",
          type: "radio",
          label: "Marital Status",
          required: true,
          options: [
            { value: "single", label: "Single" },
            { value: "married", label: "Married" },
            { value: "divorced", label: "Divorced" },
            { value: "widow", label: "Widow" },
          ],
        },
        {
          id: "qualification",
          type: "dropdown",
          label: "Qualification",
          placeholder: "Select qualification",
          required: true,
          options: [
            { value: "ug", label: "UG" },
            { value: "pg", label: "PG" },
            { value: "phd", label: "PhD" },
            { value: "diploma", label: "Diploma" },
            { value: "12th", label: "12th Pass" },
            { value: "10th", label: "10th Pass" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: "contact_details",
      title: "Contact Information",
      subtitle: "How can we reach you",
      icon: "phone",
      fields: [
        {
          id: "mobile_number",
          type: "tel",
          label: "Mobile Number",
          placeholder: "Enter 10 digit mobile number",
          required: true,
          icon: "phone",
          validation: {
            pattern: "^\\d{10}$",
            message: "Mobile number must be exactly 10 digits",
          },
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter your email",
          required: true,
          icon: "email",
          validation: {
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            message: "Please enter a valid email address",
          },
        },
        {
          id: "address",
          type: "text",
          label: "Address",
          placeholder: "Enter your address",
          required: true,
          icon: "home",
        },
      ],
    },
  ],
  submitButton: {
    label: "Submit Application",
    action: "submit",
  },
};

export const bankAccountOpeningSchema = {
  title: "Open Bank Account",
  description: "Start your banking journey with us",
  sections: [
    {
      id: "personal_info",
      title: "Personal Information",
      icon: "person",
      fields: [
        {
          id: "account_type",
          type: "radio",
          label: "Account Type",
          required: true,
          options: [
            { value: "savings", label: "Savings Account", icon: "bank" },
            { value: "current", label: "Current Account", icon: "bank" },
          ],
        },
        {
          id: "full_name",
          type: "text",
          label: "Full Name",
          placeholder: "As per PAN card",
          required: true,
          icon: "person",
        },
        {
          id: "pan_number",
          type: "text",
          label: "PAN Number",
          placeholder: "Enter PAN number",
          required: true,
        },
      ],
    },
  ],
  submitButton: {
    label: "Continue",
    action: "next",
  },
};

// Example: Simple customer registration form
export const simpleRegistrationSchema = {
  title: "Customer Registration",
  description: "Quick registration form",
  sections: [
    {
      id: "basic_info",
      title: "Basic Information",
      icon: "person",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter your name",
          required: true,
          icon: "person",
        },
        {
          id: "email",
          type: "email",
          label: "Email",
          placeholder: "your@email.com",
          required: true,
          icon: "email",
        },
        {
          id: "phone",
          type: "tel",
          label: "Phone Number",
          placeholder: "10 digit number",
          required: true,
          icon: "phone",
        },
        {
          id: "gender",
          type: "radio",
          label: "Gender",
          required: true,
          options: [
            { value: "male", label: "Male", icon: "male" },
            { value: "female", label: "Female", icon: "female" },
          ],
        },
      ],
    },
  ],
  submitButton: {
    label: "Register",
    action: "submit",
  },
};

// Helper function to get schema by ID
export const getFormSchemaById = (formId) => {
  const schemaMap = {
    api_customer_onboarding: apiEnabledCustomerSchema,
    l1_customer_info: l1CustomerOnboardingSchema,
    instant_kcc: instantKCCSchema,
    bank_account_details: bankAccountDetailsSchema,
    esign_documents: eSignDocumentsSchema,
    loan_disbursement: loanDisbursementSchema,
  };
  return schemaMap[formId] || null;
};

// Helper function to get schema by keyword
export const getFormSchemaByKeyword = (message) => {
  const lowerMessage = message.toLowerCase();

  // KVB Bank Customer Onboarding - Start with L1 (PRIORITY)
  if (
    (lowerMessage.includes("onboard") || lowerMessage.includes("onboarding")) &&
    lowerMessage.includes("customer") &&
    (lowerMessage.includes("kvb") || lowerMessage.includes("bank"))
  ) {
    console.log("🎯 Detected KVB onboarding request - returning L1 schema");
    return l1CustomerOnboardingSchema;
  }

  // L1 Customer Information - comprehensive form
  // if (lowerMessage.includes('l1') ||
  //     (lowerMessage.includes('customer') && lowerMessage.includes('information')) ||
  //     (lowerMessage.includes('complete') && lowerMessage.includes('kyc'))) {
  //   console.log('🎯 Detected L1 request');
  //   return l1CustomerOnboardingSchema;
  // }
  // L1 Customer Information - comprehensive form
  if (
    lowerMessage.includes("l1 customer") || // More specific
    lowerMessage.includes("l1 form") ||
    (lowerMessage.includes("complete") && lowerMessage.includes("kyc"))
  ) {
    console.log("🎯 Detected L1 request");
    return l1CustomerOnboardingSchema;
  }

  // L2 Instant KCC - Land & Crop Details
  if (
    lowerMessage.includes("l2") ||
    lowerMessage.includes("instant kcc") ||
    lowerMessage.includes("land details") ||
    lowerMessage.includes("crop details")
  ) {
    console.log("🎯 Detected L2 request");
    return instantKCCSchema;
  }

  // L3 Bank Account Details
  if (
    lowerMessage.includes("l3") ||
    lowerMessage.includes("bank account") ||
    lowerMessage.includes("disbursement")
  ) {
    console.log("🎯 Detected L3 request");
    return bankAccountDetailsSchema;
  }

  // Bank account opening
  if (lowerMessage.includes("open") && lowerMessage.includes("account")) {
    console.log("🎯 Detected bank account opening request");
    return bankAccountOpeningSchema;
  }

  // Simple registration
  if (
    lowerMessage.includes("register") ||
    lowerMessage.includes("registration")
  ) {
    console.log("🎯 Detected registration request");
    return simpleRegistrationSchema;
  }

  // KVB Customer Onboarding (fallback - broader match)
  if (lowerMessage.includes("KVB") && lowerMessage.includes("customer")) {
    console.log("🎯 Detected KVB customer request - returning L1 schema");
    return l1CustomerOnboardingSchema;
  }

  return null;
};

/**
 * EXAMPLE JSON SCHEMA FORMAT
 *
 * Use this template to create your own forms:
 *
 * {
 *   "title": "Form Title",
 *   "description": "Form description",
 *   "sections": [
 *     {
 *       "id": "section_1",
 *       "title": "Section Title",
 *       "subtitle": "Optional subtitle",
 *       "icon": "person|phone|email|home|bank|camera|fingerprint",
 *       "fields": [
 *         {
 *           "id": "field_id",
 *           "type": "text|email|tel|number|date|dropdown|radio|checkbox|biometric|image_capture",
 *           "label": "Field Label",
 *           "placeholder": "Placeholder text",
 *           "required": true|false,
 *           "icon": "icon_name (optional)",
 *           "enabledIf": {  // Optional conditional enabling
 *             "field": "other_field_id",   // Field to check
 *             "equals": true               // Value to match (or use "notEquals")
 *           },
 *           "validation": {  // Optional validation rules
 *             "pattern": "regex_pattern",  // Regex for validation
 *             "minLength": 3,              // Minimum length
 *             "maxLength": 50,             // Maximum length
 *             "minDate": "2000-01-01",     // For date fields
 *             "maxDate": "2006-01-01",     // For date fields
 *             "message": "Custom error message"
 *           },
 *           "options": [ // For dropdown/radio only
 *             {
 *               "value": "option_value",
 *               "label": "Option Label",
 *               "icon": "icon_name (optional, for radio with icons)"
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ],
 *   "submitButton": {
 *     "label": "Submit",
 *     "action": "submit"
 *   }
 * }
 *
 * FIELD TYPES:
 * - text: Regular text input
 * - email: Email input with validation
 * - tel: Phone number input
 * - number: Numeric input
 * - date: Date picker
 * - dropdown/select: Dropdown menu (requires options array)
 * - radio: Radio buttons (requires options array, can have icons)
 * - checkbox: Single checkbox
 * - biometric: Fingerprint scan button
 * - image_capture: Camera capture or file upload for images (PAN card, photos, etc.)
 *
 * VALIDATION OPTIONS (all optional):
 * - pattern: Regex pattern (e.g., "^\\d{12}$" for 12 digits)
 * - minLength: Minimum character length
 * - maxLength: Maximum character length
 * - minValue: Minimum numeric value (for number fields, e.g., minValue: 20)
 * - maxValue: Maximum numeric value (for number fields, e.g., maxValue: 100)
 * - minDate: Minimum date (for date fields)
 * - maxDate: Maximum date (for date fields)
 * - message: Custom error message to display
 *
 * CONDITIONAL ENABLING (enabledIf):
 * - Enable if checkbox checked: { "field": "consent_checkbox", "equals": true }
 * - Enable if dropdown value: { "field": "country", "equals": "USA" }
 * - Enable if NOT equal: { "field": "status", "notEquals": "inactive" }
 *
 * VALIDATION EXAMPLES:
 * - Aadhaar (12 digits): { "pattern": "^\\d{12}$", "message": "Must be 12 digits" }
 * - Phone (10 digits): { "pattern": "^\\d{10}$", "message": "Must be 10 digits" }
 * - Email: { "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "message": "Invalid email" }
 * - DOB before 2006: { "maxDate": "2006-01-01", "message": "Must be before 2006" }
 * - Age above 20: { "minValue": 20, "maxValue": 100, "message": "Age must be between 20 and 100" }
 * - Min 3 chars: { "minLength": 3, "message": "At least 3 characters required" }
 * - Required checkbox: { "message": "You must accept the terms" }
 *
 * AVAILABLE ICONS:
 * - person, male, female, transgender
 * - calendar, phone, email, home
 * - bank, camera, fingerprint
 */

// L1 Info - Comprehensive Customer Onboarding Schema
export const l1CustomerOnboardingSchema = {
  id: "l1_customer_info",
  title: "L1 - Customer Information",
  description: "Complete customer details for KVB onboarding",
  nextFormId: "instant_kcc",
  nextFormTitle: "Instant KCC - Land & Crop Details",
  mockData: {
    full_name: "Rajesh Kumar",
    date_of_birth: "1985-06-15",
    age: "38",
    gender: "male",
    co_type: "S/O",
    father_name: "Mohan Kumar",
    mother_name: "Lakshmi Devi",
    prospect_ethnicity: "general",
    prospect_community: "hindu",
    marital_status: "married",
    educational_qualification: "graduate",
    kyc_house_number: "12-A",
    kyc_street: "MG Road",
    kyc_locality: "Gandhi Nagar",
    kyc_landmark: "Near Central Park",
    kyc_vtc: "Bangalore Urban",
    kyc_state: "karnataka",
    kyc_district: "bangalore_urban",
    kyc_pin_code: "560001",
    mobile_number: "9876543210",
    current_house_number: "12-A",
    current_street: "MG Road",
    current_locality: "Gandhi Nagar",
    current_landmark: "Near Central Park",
    current_vtc: "Bangalore Urban",
    current_state: "karnataka",
    current_district: "bangalore_urban",
    current_pin_code: "560001",
    alternate_mobile_number: "9876543211",
    country: "india",
    bank_state: "karnataka",
    bank_city: "bangalore",
    sol_id: "KVB0001234",
    annual_net_income: "500000",
    profession: "salaried",
    belongs_to: "general",
    pan_available: "yes",
    pan_number: "ABCDE1234F",
    kyc_type: "aadhaar",
    kyc_document_number: "123456789012",
    id_issue_date: "2020-01-15",
    id_expiry_date: "2030-01-15",
  },
  sections: [
    {
      id: "applicant_details",
      title: "Applicant Details",
      subtitle: "Personal information of the applicant",
      icon: "person",
      fields: [
        {
          id: "full_name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter full name",
          required: true,
          icon: "person",
          validation: {
            pattern: "^[A-Za-z ]+$",
            message: "Only alphabetic characters allowed",
          },
        },
        {
          id: "date_of_birth",
          type: "date",
          label: "Date of Birth",
          placeholder: "Select date of birth",
          required: true,
          icon: "calendar",
          validation: {
            maxDate: "2006-01-01",
            message: "Must be born before 2006",
          },
        },
        {
          id: "age",
          type: "number",
          label: "Age",
          placeholder: "Enter age",
          required: true,
          validation: {
            pattern: "^\\d+$",
            minValue: 20,
            maxValue: 69,
            message: "Age must be between 20 and 69",
          },
        },
        {
          id: "gender",
          type: "radio",
          label: "Gender",
          required: true,
          options: [
            { value: "male", label: "Male", icon: "male" },
            { value: "female", label: "Female", icon: "female" },
            { value: "other", label: "Other", icon: "transgender" },
          ],
        },
        {
          id: "co_type",
          type: "dropdown",
          label: "C/O",
          placeholder: "Select relation",
          required: true,
          options: [
            { value: "S/O", label: "S/O (Son of)" },
            { value: "D/O", label: "D/O (Daughter of)" },
            { value: "W/O", label: "W/O (Wife of)" },
            { value: "C/O", label: "C/O (Care of)" },
          ],
          validation: {
            pattern: "^[A-Za-z /()]+$",
            message:
              "Only alphabetic characters, slashes, and brackets allowed",
          },
        },
        {
          id: "father_name",
          type: "text",
          label: "Father's Name",
          placeholder: "Enter father's name",
          required: false,
          icon: "person",
          validation: {
            pattern: "^[A-Za-z ]+$",
            message: "Only alphabetic characters allowed",
          },
        },
        {
          id: "mother_name",
          type: "text",
          label: "Mother's Name",
          placeholder: "Enter mother's name",
          required: false,
          icon: "person",
          validation: {
            pattern: "^[A-Za-z ]+$",
            message: "Only alphabetic characters allowed",
          },
        },
        {
          id: "prospect_photo_kyc",
          type: "image_capture",
          label: "Prospect Photo (KYC)",
          placeholder: "Capture or upload KYC photo",
          required: true,
          validation: {
            message: "KYC photo is required",
          },
        },
        {
          id: "prospect_recent_photo",
          type: "image_capture",
          label: "Prospect Recent Photo",
          placeholder: "Capture or upload recent photo (max 1 image)",
          required: false,
          validation: {
            message: "Recent photo is required",
          },
        },
        {
          id: "prospect_ethnicity",
          type: "dropdown",
          label: "Prospect Ethnicity",
          placeholder: "Select ethnicity",
          required: false,
          options: [
            { value: "general", label: "General" },
            { value: "obc", label: "OBC" },
            { value: "sc", label: "SC" },
            { value: "st", label: "ST" },
            { value: "others", label: "Others" },
          ],
        },
        {
          id: "prospect_community",
          type: "dropdown",
          label: "Prospect Community",
          placeholder: "Select community",
          required: false,
          options: [
            { value: "hindu", label: "Hindu" },
            { value: "muslim", label: "Muslim" },
            { value: "christian", label: "Christian" },
            { value: "sikh", label: "Sikh" },
            { value: "others", label: "Others" },
          ],
        },
        {
          id: "marital_status",
          type: "radio",
          label: "Marital Status",
          required: false,
          options: [
            { value: "single", label: "Single" },
            { value: "married", label: "Married" },
            { value: "divorced", label: "Divorced" },
            { value: "widowed", label: "Widowed" },
          ],
        },
        {
          id: "educational_qualification",
          type: "dropdown",
          label: "Educational Qualification",
          placeholder: "Select qualification",
          required: false,
          options: [
            { value: "below_10th", label: "Below 10th" },
            { value: "10th_pass", label: "10th Pass" },
            { value: "12th_pass", label: "12th Pass" },
            { value: "graduate", label: "Graduate" },
            { value: "post_graduate", label: "Post Graduate" },
            { value: "professional", label: "Professional Degree" },
          ],
        },
      ],
    },
    {
      id: "kyc_address",
      title: "KYC Address",
      subtitle: "Address as per KYC documents",
      icon: "home",
      fields: [
        {
          id: "kyc_house_number",
          type: "text",
          label: "House Number",
          placeholder: "Enter house number",
          required: true,
          icon: "home",
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "kyc_street",
          type: "text",
          label: "Street",
          placeholder: "Enter street name",
          required: true,
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "kyc_locality",
          type: "text",
          label: "Locality",
          placeholder: "Enter locality",
          required: true,
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "kyc_landmark",
          type: "text",
          label: "Landmark",
          placeholder: "Enter landmark (optional)",
          required: false,
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "kyc_vtc",
          type: "text",
          label: "VTC (Village/Town/City)",
          placeholder: "Enter VTC",
          required: true,
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "kyc_state",
          type: "dropdown",
          label: "State",
          placeholder: "Select state",
          required: true,
          options: [
            { value: "karnataka", label: "Karnataka" },
            { value: "maharashtra", label: "Maharashtra" },
            { value: "tamil_nadu", label: "Tamil Nadu" },
            { value: "delhi", label: "Delhi" },
            { value: "west_bengal", label: "West Bengal" },
            { value: "uttar_pradesh", label: "Uttar Pradesh" },
          ],
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "kyc_district",
          type: "dropdown",
          label: "District",
          placeholder: "Select district",
          required: true,
          options: [
            { value: "bangalore_urban", label: "Bangalore Urban" },
            { value: "bangalore_rural", label: "Bangalore Rural" },
            { value: "mysore", label: "Mysore" },
            { value: "mumbai", label: "Mumbai" },
            { value: "pune", label: "Pune" },
          ],
          validation: {
            maxLength: 36,
            message: "Maximum 36 characters allowed",
          },
        },
        {
          id: "kyc_pin_code",
          type: "text",
          label: "Pin Code",
          placeholder: "Enter 6-digit pin code",
          required: true,
          validation: {
            pattern: "^\\d{6}$",
            message: "Pin code must be exactly 6 digits",
          },
        },
        {
          id: "mobile_number",
          type: "tel",
          label: "Mobile Number",
          placeholder: "Enter 10-digit mobile number",
          required: false,
          icon: "phone",
          validation: {
            pattern: "^\\d{10}$",
            message: "Mobile number must be exactly 10 digits",
          },
        },
      ],
    },
    {
      id: "current_address",
      title: "Current Address",
      subtitle: "Present residential address",
      icon: "home",
      fields: [
        {
          id: "same_as_kyc",
          type: "checkbox",
          label: "Same as KYC Address",
          required: false,
        },
        {
          id: "current_house_number",
          type: "text",
          label: "House Number",
          placeholder: "Enter house number",
          required: false,
          icon: "home",
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "current_street",
          type: "text",
          label: "Street",
          placeholder: "Enter street name",
          required: false,
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "current_locality",
          type: "text",
          label: "Locality",
          placeholder: "Enter locality",
          required: false,
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "current_landmark",
          type: "text",
          label: "Landmark",
          placeholder: "Enter landmark (optional)",
          required: false,
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "current_vtc",
          type: "text",
          label: "VTC (Village/Town/City)",
          placeholder: "Enter VTC",
          required: false,
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "current_state",
          type: "dropdown",
          label: "State",
          placeholder: "Select state",
          required: false,
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          options: [
            { value: "karnataka", label: "Karnataka" },
            { value: "maharashtra", label: "Maharashtra" },
            { value: "tamil_nadu", label: "Tamil Nadu" },
            { value: "delhi", label: "Delhi" },
            { value: "west_bengal", label: "West Bengal" },
            { value: "uttar_pradesh", label: "Uttar Pradesh" },
          ],
          validation: {
            maxLength: 35,
            message: "Maximum 35 characters allowed",
          },
        },
        {
          id: "current_district",
          type: "dropdown",
          label: "District",
          placeholder: "Select district",
          required: true,
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          options: [
            { value: "bangalore_urban", label: "Bangalore Urban" },
            { value: "bangalore_rural", label: "Bangalore Rural" },
            { value: "mysore", label: "Mysore" },
            { value: "mumbai", label: "Mumbai" },
            { value: "pune", label: "Pune" },
          ],
          validation: {
            maxLength: 36,
            message: "Maximum 36 characters allowed",
          },
        },
        {
          id: "current_pin_code",
          type: "text",
          label: "Pin Code",
          placeholder: "Enter 6-digit pin code",
          required: false,
          enabledIf: {
            field: "same_as_kyc",
            notEquals: true,
          },
          validation: {
            pattern: "^\\d{6}$",
            message: "Pin code must be exactly 6 digits",
          },
        },
        {
          id: "alternate_mobile_number",
          type: "tel",
          label: "Alternate Mobile Number",
          placeholder: "Enter 10-digit mobile number",
          required: false,
          icon: "phone",
          validation: {
            pattern: "^\\d{10}$",
            message: "Mobile number must be exactly 10 digits",
          },
        },
      ],
    },
    {
      id: "bank_master",
      title: "Bank's Master",
      subtitle: "Bank location details",
      icon: "bank",
      fields: [
        {
          id: "country",
          type: "dropdown",
          label: "Country",
          placeholder: "Select country",
          required: false,
          options: [
            { value: "india", label: "India" },
            { value: "usa", label: "United States" },
            { value: "uk", label: "United Kingdom" },
            { value: "australia", label: "Australia" },
          ],
        },
        {
          id: "bank_state",
          type: "dropdown",
          label: "State",
          placeholder: "Select state",
          required: false,
          options: [
            { value: "karnataka", label: "Karnataka" },
            { value: "maharashtra", label: "Maharashtra" },
            { value: "tamil_nadu", label: "Tamil Nadu" },
            { value: "delhi", label: "Delhi" },
          ],
        },
        {
          id: "bank_city",
          type: "dropdown",
          label: "City",
          placeholder: "Select city",
          required: false,
          options: [
            { value: "bangalore", label: "Bangalore" },
            { value: "mumbai", label: "Mumbai" },
            { value: "chennai", label: "Chennai" },
            { value: "delhi", label: "Delhi" },
            { value: "pune", label: "Pune" },
          ],
        },
        {
          id: "sol_id",
          type: "text",
          label: "SOL ID",
          placeholder: "Enter SOL ID",
          required: true,
          icon: "bank",
          validation: {
            pattern: "^[A-Z]{4}\\d{7}$",
            message: "Invalid SOL ID format",
          },
        },
      ],
    },
    {
      id: "other_information",
      title: "Other Information",
      subtitle: "Additional applicant details",
      icon: "person",
      fields: [
        {
          id: "annual_net_income",
          type: "number",
          label: "Annual Net Income",
          placeholder: "Enter annual income",
          required: false,
          validation: {
            pattern: "^\\d+$",
            message: "Only numeric values allowed",
          },
        },
        {
          id: "profession",
          type: "radio",
          label: "Profession",
          required: false,
          options: [
            { value: "salaried", label: "Salaried" },
            { value: "self_employed", label: "Self Employed" },
            { value: "business", label: "Business" },
            { value: "professional", label: "Professional" },
            { value: "agriculture", label: "Agriculture" },
            { value: "retired", label: "Retired" },
          ],
        },
        {
          id: "belongs_to",
          type: "dropdown",
          label: "Belongs to",
          placeholder: "Select category",
          required: false,
          options: [
            { value: "general", label: "General" },
            { value: "obc", label: "OBC" },
            { value: "sc", label: "SC" },
            { value: "st", label: "ST" },
            { value: "minority", label: "Minority" },
          ],
        },
      ],
    },
    {
      id: "pan_card_section",
      title: "PAN Card",
      subtitle: "PAN card information",
      icon: "fingerprint",
      fields: [
        {
          id: "pan_available",
          type: "radio",
          label: "Is PAN card available?",
          required: false,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "pan_number",
          type: "text",
          label: "PAN Card Number",
          placeholder: "Enter PAN number (e.g., ABCDE1234F)",
          required: false,
          icon: "fingerprint",
          enabledIf: {
            field: "pan_available",
            equals: "yes",
          },
          validation: {
            pattern: "^[A-Z]{5}\\d{4}[A-Z]$",
            message: "Invalid PAN format (e.g., ABCDE1234F)",
          },
        },
        {
          id: "pan_card_image",
          type: "image_capture",
          label: "PAN Card Image",
          placeholder: "Capture or upload PAN card (max 2 images)",
          required: false,
          enabledIf: {
            field: "pan_available",
            equals: "yes",
          },
          validation: {
            message: "PAN card image is required",
          },
        },
      ],
    },
    {
      id: "other_kyc",
      title: "Other KYC Information",
      subtitle: "Additional KYC documents",
      icon: "fingerprint",
      fields: [
        {
          id: "kyc_type",
          type: "dropdown",
          label: "KYC Type",
          placeholder: "Select KYC document type",
          required: false,
          options: [
            { value: "aadhaar", label: "Aadhaar Card" },
            { value: "voter_id", label: "Voter ID" },
            { value: "driving_license", label: "Driving License" },
            { value: "passport", label: "Passport" },
            { value: "ration_card", label: "Ration Card" },
          ],
        },
        {
          id: "kyc_document_number",
          type: "text",
          label: "KYC Document Number",
          placeholder: "Enter document number",
          required: false,
          enabledIf: {
            field: "kyc_type",
            notEquals: "",
          },
          validation: {
            message: "Document number is required",
          },
        },
        {
          id: "id_issue_date",
          type: "date",
          label: "ID Issue Date",
          placeholder: "Select issue date",
          required: false,
          icon: "calendar",
          enabledIf: {
            field: "kyc_type",
            notEquals: "",
          },
          validation: {
            message: "Issue date is required",
          },
        },
        {
          id: "id_expiry_date",
          type: "date",
          label: "ID Expiry Date",
          placeholder: "Select expiry date",
          required: false,
          icon: "calendar",
          enabledIf: {
            field: "kyc_type",
            notEquals: "",
          },
          validation: {
            message: "Expiry date is required",
          },
        },
        {
          id: "kyc_photo",
          type: "image_capture",
          label: "KYC Photo",
          placeholder: "Capture or upload KYC document (max 2 images)",
          required: false,
          enabledIf: {
            field: "kyc_type",
            notEquals: "",
          },
          validation: {
            message: "KYC document photo is required",
          },
        },
      ],
    },
  ],
  submitButton: {
    label: "Submit",
    action: "submit",
  },
};

// L2 Info - Instant KCC Section
export const instantKCCSchema = {
  id: "instant_kcc",
  title: "Instant KCC - Land & Crop Details",
  description: "Agriculture loan and land information",
  nextFormId: "bank_account_details",
  nextFormTitle: "Bank Account Details",
  mockData: {
    allied_loan: "poultry",
    state: "karnataka",
    district: "bangalore_urban",
    taluk: "bangalore_north",
    village: "yelahanka",
    survey_number: "SV-123/456",
    sub_division_number: "SD-01",
    land_owner_name: "Rajesh Kumar",
    land_extent: "2.5",
    patta_no: "PT-12345",
    land_record_verified: "verified",
    document_type: "patta_chitta_adangal",
    land_classification: "irrigated",
    joint_patta: "yes",
    cultivable_land: "2.3",
    crop_group: "cereals",
    crop_name: "paddy",
    scale_of_finance: "45000",
    land_holding: "2.5",
    land_holding_by_applicant: "2.5",
    season: "kharif",
    animal_type: "buffaloes",
    breed: "murrah",
    number_of_animals: "8",
    milk_society_name: "ahope",
    eligible_loan_amount: "112500",
    opted_loan_amount: "100000",
    scheme_type: "kisan_credit_card",
    loan_tenor: "12_months",
    prospect_consent: true,
    security_value: "112500",
    opt_pmfby: "yes",
    distance_from_branch: "5.5",
    applicant_farming: "yes",
    irrigation_electricity: "yes",
    land_proof_submitted: "yes",
    market_availability: "3.2",
    family_farming: "yes",
    farming_experience: "15",
    able_to_carry: "yes",
    agri_officer_comments:
      "Good land condition with proper irrigation facilities",
  },
  sections: [
    {
      id: "land_details",
      title: "Land Details",
      subtitle: "Property and land information",
      icon: "home",
      fields: [
        {
          id: "allied_loan",
          type: "dropdown",
          label: "Allied Loan",
          placeholder: "Select allied loan type",
          required: false,
          options: [
            { value: "poultry", label: "Poultry" },
            { value: "dairy", label: "Dairy" },
            { value: "fishery", label: "Fishery" },
            { value: "goatery", label: "Goatery" },
          ],
        },
        {
          id: "state",
          type: "dropdown",
          label: "State",
          placeholder: "Select state",
          required: true,
          options: [
            { value: "karnataka", label: "Karnataka" },
            { value: "maharashtra", label: "Maharashtra" },
            { value: "tamil_nadu", label: "Tamil Nadu" },
            { value: "kerala", label: "Kerala" },
          ],
        },
        {
          id: "district",
          type: "dropdown",
          label: "District",
          placeholder: "Select district (based on state)",
          required: true,
          options: [
            { value: "bangalore_urban", label: "Bangalore Urban" },
            { value: "bangalore_rural", label: "Bangalore Rural" },
            { value: "mysore", label: "Mysore" },
            { value: "mangalore", label: "Mangalore" },
          ],
        },
        {
          id: "taluk",
          type: "dropdown",
          label: "Taluk",
          placeholder: "Select taluk (based on district)",
          required: true,
          options: [
            { value: "bangalore_north", label: "Bangalore North" },
            { value: "bangalore_south", label: "Bangalore South" },
            { value: "anekal", label: "Anekal" },
          ],
        },
        {
          id: "village",
          type: "dropdown",
          label: "Village",
          placeholder: "Select village (based on taluk)",
          required: true,
          options: [
            { value: "yelahanka", label: "Yelahanka" },
            { value: "devanahalli", label: "Devanahalli" },
            { value: "doddaballapur", label: "Doddaballapur" },
          ],
        },
        {
          id: "survey_number",
          type: "text",
          label: "Survey Number",
          placeholder: "Enter survey number (e.g., SV-123/456)",
          required: true,
          validation: {
            message: "Survey number is required",
          },
        },
        {
          id: "sub_division_number",
          type: "text",
          label: "Sub Division Number",
          placeholder: "Enter sub division number (e.g., SD-01)",
          required: true,
          validation: {
            message: "Sub division number is required",
          },
        },
        {
          id: "land_owner_name",
          type: "text",
          label: "Land Owner Name",
          placeholder: "Enter land owner name",
          required: true,
          icon: "person",
          validation: {
            pattern: "^[A-Za-z ]+$",
            message: "Only alphabetic characters allowed",
          },
        },
        {
          id: "land_extent",
          type: "number",
          label: "Land Extent (in hectares)",
          placeholder: "Enter land extent (e.g., 2.5)",
          required: true,
          validation: {
            pattern: "^\\d+(\\.\\d+)?$",
            message: "Enter valid numeric value with decimals",
          },
        },
        {
          id: "patta_no",
          type: "text",
          label: "Patta No",
          placeholder: "Enter patta number",
          required: true,
          validation: {
            message: "Patta number is required",
          },
        },
        {
          id: "land_record_verified",
          type: "radio",
          label: "Land Record Verified",
          required: true,
          options: [
            { value: "verified", label: "Verified" },
            { value: "rejected", label: "Rejected" },
          ],
        },
        {
          id: "document_type",
          type: "dropdown",
          label: "Document Type",
          placeholder: "Select document type",
          required: false,
          options: [
            { value: "patta_chitta_adangal", label: "Patta/Chitta/Adangal" },
            { value: "patta", label: "Patta" },
            { value: "chitta", label: "Chitta" },
          ],
        },
        {
          id: "document_image",
          type: "image_capture",
          label: "Document Image",
          placeholder: "Capture or upload document images (multiple)",
          required: false,
          validation: {
            message: "Document image is required",
          },
        },
        {
          id: "land_photo",
          type: "image_capture",
          label: "Land Photo",
          placeholder: "Capture or upload land photos (multiple)",
          required: false,
          validation: {
            message: "Land photo is required",
          },
        },
        {
          id: "land_classification",
          type: "dropdown",
          label: "Land Classification",
          placeholder: "Select land classification",
          required: false,
          options: [
            { value: "irrigated", label: "Irrigated Land Holding" },
            { value: "non_irrigated", label: "Non Irrigated Land Holding" },
          ],
        },
        {
          id: "joint_patta",
          type: "radio",
          label: "Joint Patta",
          required: true,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "possession_certificate",
          type: "image_capture",
          label: "Possession Certificate",
          placeholder: "Upload up to 3 images or PDF",
          required: true,
          validation: {
            message: "Possession certificate is required",
          },
        },
        {
          id: "encumbrance_certificate",
          type: "image_capture",
          label: "Encumbrance Certificate",
          placeholder: "Upload single image or PDF",
          required: true,
          validation: {
            message: "Encumbrance certificate is required",
          },
        },
      ],
    },
    {
      id: "scale_of_finance",
      title: "Scale of Finance Calculation",
      subtitle: "Crop and finance details",
      icon: "bank",
      fields: [
        {
          id: "cultivable_land",
          type: "number",
          label: "Cultivable Land (in hectares)",
          placeholder: "Enter cultivable land",
          required: true,
          validation: {
            pattern: "^\\d+(\\.\\d+)?$",
            message: "Must not exceed total land extent",
          },
        },
        {
          id: "crop_group",
          type: "dropdown",
          label: "Crop Group",
          placeholder: "Select crop group",
          required: true,
          options: [
            { value: "cereals", label: "Cereals" },
            { value: "pulses", label: "Pulses" },
            { value: "oilseeds", label: "Oilseeds" },
            { value: "commercial_crops", label: "Commercial Crops" },
            { value: "horticulture", label: "Horticulture" },
          ],
        },
        {
          id: "crop_name",
          type: "dropdown",
          label: "Crop Name",
          placeholder: "Select crop name",
          required: true,
          options: [
            { value: "paddy", label: "Paddy" },
            { value: "wheat", label: "Wheat" },
            { value: "maize", label: "Maize" },
            { value: "cotton", label: "Cotton" },
            { value: "sugarcane", label: "Sugarcane" },
          ],
        },
        {
          id: "scale_of_finance",
          type: "number",
          label: "Scale of Finance (Auto Fetched)",
          placeholder: "Auto calculated",
          required: true,
          validation: {
            message: "Scale of finance is required",
          },
        },
        {
          id: "land_holding",
          type: "number",
          label: "Land Holding (in hectares)",
          placeholder: "Auto calculated",
          required: true,
        },
        {
          id: "land_holding_by_applicant",
          type: "number",
          label: "Land Holding by Applicant (in hectares)",
          placeholder: "Enter applicant's land holding",
          required: true,
          validation: {
            pattern: "^\\d+(\\.\\d+)?$",
            message: "Enter valid numeric value",
          },
        },
        {
          id: "season",
          type: "dropdown",
          label: "Season",
          placeholder: "Select season",
          required: true,
          options: [
            { value: "rabi", label: "Rabi" },
            { value: "kharif", label: "Kharif" },
            { value: "summer", label: "Summer" },
          ],
        },
      ],
    },
    {
      id: "livestock_details",
      title: "Add Animal",
      subtitle: "Livestock and animal information",
      icon: "pets",
      fields: [
        {
          id: "animal_type",
          type: "radio",
          label: "Type of Animal",
          required: true,
          options: [
            { value: "buffaloes", label: "Buffaloes", icon: "buffalo" },
            { value: "cows", label: "Cows", icon: "cow" },
            { value: "goats_sheep", label: "Goats/Sheep", icon: "goat" },
            { value: "pigs", label: "Pigs", icon: "pig" },
            { value: "rabbit", label: "Rabbit", icon: "rabbit" },
            { value: "birds", label: "Birds", icon: "bird" },
            { value: "fish_seedlings", label: "Fish Seedlings", icon: "fish" },
            { value: "others", label: "Others", icon: "paw" },
          ],
        },
        {
          id: "breed",
          type: "dropdown",
          label: "Breed",
          placeholder: "Select breed",
          required: true,
          options: [
            { value: "breed1", label: "Breed Name 1" },
            { value: "breed2", label: "Breed Name 2" },
            { value: "breed3", label: "Breed Name 3" },
            { value: "murrah", label: "Murrah" },
            { value: "surti", label: "Surti" },
            { value: "jafarabadi", label: "Jafarabadi" },
            { value: "sahiwal", label: "Sahiwal" },
            { value: "gir", label: "Gir" },
            { value: "red_sindhi", label: "Red Sindhi" },
            { value: "jersey", label: "Jersey" },
            { value: "holstein_friesian", label: "Holstein Friesian" },
          ],
        },
        {
          id: "number_of_animals",
          type: "number",
          label: "Number of Animals",
          placeholder: "Enter number of animals",
          required: true,
          validation: {
            pattern: "^[1-9]\\d*$",
            minValue: 1,
            message: "Enter valid number of animals (minimum 1)",
          },
        },
        {
          id: "scale_of_finance",
          type: "number",
          label: "Scale Of Finance",
          placeholder: "Enter scale of finance",
          required: true,
          validation: {
            pattern: "^\\d+(\\.\\d{1,2})?$",
            minValue: 0,
            message: "Enter valid amount",
          },
        },
        {
          id: "milk_society_name",
          type: "dropdown",
          label: "Milk Society Name",
          placeholder: "Select milk society",
          required: true,
          options: [
            { value: "ahope", label: "AHOPE Solutions Private Limited" },
            { value: "digivriddhi", label: "Digivriddhi Technologies Pvt Ltd" },
            { value: "payagri", label: "Pay Agri Innovations Pvt.Ltd" },
            { value: "amul", label: "Amul Dairy" },
            { value: "mother_dairy", label: "Mother Dairy" },
            { value: "nandini", label: "Nandini" },
          ],
        },
      ],
    },
    {
      id: "household_members",
      title: "Add Household Members",
      subtitle: "Family member information",
      icon: "person",
      fields: [
        {
          id: "member_name",
          type: "text",
          label: "Name",
          placeholder: "Enter family member name",
          required: true,
          icon: "person",
          validation: {
            pattern: "^[A-Za-z ]+$",
            message: "Only alphabetic characters allowed",
          },
        },
        {
          id: "member_gender",
          type: "radio",
          label: "Gender",
          required: true,
          options: [
            { value: "male", label: "Male", icon: "male" },
            { value: "female", label: "Female", icon: "female" },
          ],
        },
        {
          id: "member_dob",
          type: "date",
          label: "Date of Birth",
          placeholder: "Select date of birth",
          required: true,
          icon: "calendar",
        },
        {
          id: "member_relationship",
          type: "dropdown",
          label: "Relationship with Prospect",
          placeholder: "Select relationship",
          required: true,
          options: [
            { value: "spouse", label: "Spouse" },
            { value: "son", label: "Son" },
            { value: "daughter", label: "Daughter" },
            { value: "father", label: "Father" },
            { value: "mother", label: "Mother" },
            { value: "brother", label: "Brother" },
            { value: "sister", label: "Sister" },
          ],
        },
      ],
    },
    {
      id: "loan_details",
      title: "Loan Details",
      subtitle: "Loan amount and scheme information",
      icon: "bank",
      fields: [
        {
          id: "overall_limit",
          type: "text",
          label: "Overall Limit",
          placeholder: "₹1,60,000 (default)",
          required: true,
          validation: {
            message: "Default limit is ₹1,60,000",
          },
        },
        {
          id: "eligible_loan_amount",
          type: "number",
          label: "Eligible Loan Amount (Auto Calculated)",
          placeholder: "Auto calculated",
          required: true,
          validation: {
            pattern: "^\\d+(\\.\\d+)?$",
            message: "Numeric with decimals (round-down)",
          },
        },
        {
          id: "opted_loan_amount",
          type: "number",
          label: "Opted Loan Amount",
          placeholder: "Enter opted loan amount",
          required: true,
          validation: {
            pattern: "^\\d+$",
            message: "Enter valid numeric value",
          },
        },
        {
          id: "scheme_type",
          type: "dropdown",
          label: "Scheme Type",
          placeholder: "Select scheme",
          required: true,
          options: [
            { value: "kisan_credit_card", label: "Kisan Credit Card (KCC)" },
            { value: "crop_loan", label: "Crop Loan" },
            { value: "term_loan", label: "Term Loan" },
          ],
        },
        {
          id: "loan_tenor",
          type: "dropdown",
          label: "Loan Tenor",
          placeholder: "Select loan tenor",
          required: true,
          options: [
            { value: "6_months", label: "6 Months" },
            { value: "12_months", label: "12 Months" },
            { value: "18_months", label: "18 Months" },
            { value: "24_months", label: "24 Months" },
          ],
        },
        {
          id: "prospect_consent",
          type: "checkbox",
          label: "Prospect consent for the loan amount",
          required: true,
          validation: {
            message: "Consent is required to proceed",
          },
        },
        {
          id: "security_value",
          type: "number",
          label: "Security Value (Auto Populated)",
          placeholder: "Auto populated from eligible loan amount",
          required: false,
          enabledIf: {
            field: "prospect_consent",
            equals: true,
          },
        },
        {
          id: "opt_pmfby",
          type: "radio",
          label: "Opt for PMFBY Scheme?",
          required: false,
          enabledIf: {
            field: "prospect_consent",
            equals: true,
          },
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
      ],
    },
    {
      id: "bank_assessment",
      title: "Bank Assessment Questions",
      subtitle: "Additional assessment information",
      icon: "fingerprint",
      fields: [
        {
          id: "distance_from_branch",
          type: "number",
          label: "Distance from Bank Branch (in kms)",
          placeholder: "Enter distance",
          required: false,
          validation: {
            pattern: "^\\d+(\\.\\d+)?$",
            message: "Enter valid numeric value with decimals",
          },
        },
        {
          id: "applicant_farming",
          type: "radio",
          label: "Applicant involved in farming activities",
          required: false,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "irrigation_electricity",
          type: "radio",
          label:
            "Whether source of irrigation, electricity facility available?",
          required: false,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "land_proof_submitted",
          type: "radio",
          label: "Agri land holding proof submitted?",
          required: false,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "market_availability",
          type: "number",
          label: "Availability of the Agri produce market nearby (Kms)",
          placeholder: "Enter distance",
          required: false,
          validation: {
            pattern: "^\\d+(\\.\\d+)?$",
            message: "Enter valid numeric value with decimals",
          },
        },
        {
          id: "family_farming",
          type: "radio",
          label: "Whether applicant and family involved in farming activities?",
          required: false,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "farming_experience",
          type: "number",
          label: "Applicant experience in farming activity (yrs)",
          placeholder: "Enter years of experience",
          required: false,
          validation: {
            pattern: "^\\d+(\\.\\d+)?$",
            message: "Enter valid numeric value",
          },
        },
        {
          id: "able_to_carry",
          type: "radio",
          label:
            "Whether the applicant able to carry out set forth activities?",
          required: false,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "agri_officer_comments",
          type: "text",
          label: "Agri Officer Comments",
          placeholder: "Enter comments",
          required: false,
        },
      ],
    },
  ],
  submitButton: {
    label: "Submit",
    action: "submit",
  },
};

// L3 Info - Bank Account Details Section
export const bankAccountDetailsSchema = {
  id: "bank_account_details",
  title: "Bank Account Details",
  description: "Disbursement and account information",
  nextFormId: "esign_documents",
  nextFormTitle: "E-Sign Documents",
  mockData: {
    disbursement_preference: "other_bank",
    account_holder_name: "Rajesh Kumar",
    account_number: "1234567890",
    re_enter_account_number: "1234567890",
    ifsc_code: "KVB0001234",
    bank_branch_name: "Koramangala Branch",
    bank_branch_address: "123 Main Road, Koramangala, Bangalore - 560034",
    bank_name: "KVB Bank",
  },
  sections: [
    {
      id: "disbursement_details",
      title: "Disbursement Preference",
      subtitle: "Select account type and provide details",
      icon: "bank",
      fields: [
        {
          id: "disbursement_preference",
          type: "radio",
          label: "Disbursement Preference",
          required: true,
          options: [
            { value: "new_to_bank", label: "New to Bank Account" },
            { value: "other_bank", label: "Other Bank Account" },
          ],
        },
        {
          id: "account_holder_name",
          type: "text",
          label: "Account Holder Name (Auto Fetched)",
          placeholder: "Name from e-KYC",
          required: true,
          icon: "person",
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
          validation: {
            message: "Auto-populated from UIDAI e-KYC",
          },
        },
        {
          id: "account_number",
          type: "text",
          label: "Account Number",
          placeholder: "Enter account number",
          required: true,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
          validation: {
            pattern: "^[0-9]{9,18}$",
            message: "Enter valid account number (9-18 digits)",
          },
        },
        {
          id: "re_enter_account_number",
          type: "text",
          label: "Re-enter Account Number",
          placeholder: "Re-enter account number",
          required: true,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
          validation: {
            pattern: "^[0-9]{9,18}$",
            message: "Account numbers must match",
          },
        },
        {
          id: "ifsc_code",
          type: "text",
          label: "IFSC Code",
          placeholder: "Enter IFSC code (e.g., KVB0001234)",
          required: true,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
          validation: {
            pattern: "^[A-Z]{4}0[A-Z0-9]{6}$",
            message: "Enter valid IFSC code",
          },
        },
        {
          id: "bank_branch_name",
          type: "text",
          label: "Bank Branch Name (Auto Fetched)",
          placeholder: "Auto populated from IFSC",
          required: true,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
        },
        {
          id: "bank_branch_address",
          type: "text",
          label: "Bank Branch Address (Auto Fetched)",
          placeholder: "Auto populated from IFSC",
          required: true,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
        },
        {
          id: "bank_name",
          type: "text",
          label: "Bank Name (Auto Fetched)",
          placeholder: "Auto populated from IFSC",
          required: true,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
        },
        {
          id: "proof_of_account",
          type: "image_capture",
          label: "Proof of Account",
          placeholder: "Capture or upload account proof (multiple images)",
          required: true,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
          validation: {
            message: "Account proof is required",
          },
        },
        {
          id: "customer_signature_other_bank",
          type: "image_capture",
          label: "Customer Signature Image",
          placeholder: "Capture customer signature (single image)",
          required: false,
          showIf: {
            field: "disbursement_preference",
            equals: "other_bank",
          },
          validation: {
            message: "Signature required for new to bank customers",
          },
        },
        {
          id: "customer_signature_new_bank",
          type: "image_capture",
          label: "Customer Signature Image",
          placeholder: "Capture customer signature (single image)",
          required: false,
          showIf: {
            field: "disbursement_preference",
            equals: "new_to_bank",
          },
          validation: {
            message: "Signature required for new bank account",
          },
        },
        {
          id: "bank_consent",
          type: "checkbox",
          label:
            "Kindly confirm with the customer if there is a KVB Bank branch within the radius of 10 kilometers of the customer's house",
          required: false,
          showIf: {
            field: "disbursement_preference",
            equals: "new_to_bank",
          },
        },
      ],
    },
  ],
  submitButton: {
    label: "Submit",
    action: "submit",
  },
};

// E-Sign Documents Schema
export const eSignDocumentsSchema = {
  id: "esign_documents",
  title: "E-sign",
  description: "Authenticate with your fingerprint to sign the loan documents",
  nextFormId: "loan_disbursement",
  nextFormTitle: "Loan Disbursement",
  mockData: {
    customer_name: "Rajesh Kumar",
    biometric_captured: false,
  },
  sections: [
    {
      id: "esign_section",
      title: "Instant KCC",
      subtitle: "Place your finger on the scanner to complete e-signature",
      icon: "fingerprint",
      fields: [
        {
          id: "customer_name",
          type: "text",
          label: "Customer Name",
          placeholder: "Your name",
          required: false,
          readOnly: true,
          defaultValue: "Rajesh Kumar",
          icon: "person",
        },
        {
          id: "biometric_scan",
          type: "biometric",
          label: "Tap to scan fingerprint",
          required: true,
          validation: {
            message: "Please complete fingerprint authentication to proceed",
          },
        },
        {
          id: "pdf_preview",
          type: "button",
          label: "View Loan Agreement",
          buttonLabel: "Preview PDF Document",
          required: false,
          action: "view_pdf",
          variant: "outlined",
          icon: "pdf",
        },
      ],
    },
  ],
  submitButton: {
    label: "Complete E-Sign",
    action: "submit",
  },
};

// Loan Disbursement Success Schema
export const loanDisbursementSchema = {
  id: "loan_disbursement",
  title: "Loan Disbursement",
  description: "Your loan has been processed successfully",
  mockData: {},
  sections: [
    {
      id: "disbursement_success",
      title: "E-sign Successful",
      subtitle: "Your loan will be disbursed within 24-48 hours",
      icon: "check_circle",
      fields: [
        {
          id: "view_documents_button",
          type: "button",
          label: "View Signed Documents",
          buttonLabel: "View E-Signed PDF",
          required: false,
          action: "view_pdf",
          variant: "contained",
          icon: "pdf",
        },
      ],
    },
  ],
  submitButton: {
    label: "Done",
    action: "complete",
  },
};
