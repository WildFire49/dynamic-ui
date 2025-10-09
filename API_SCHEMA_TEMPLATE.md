# API-Enabled Form Schema Template

## Overview
This template extends the form schema to support API integration for dynamic data loading and action handling.

## Schema Structure with API Support

### 1. **API Configuration at Field Level**

```javascript
{
  id: "state",
  type: "dropdown",
  label: "State",
  placeholder: "Select state",
  required: true,
  
  // API configuration for loading options
  api: {
    endpoint: "/api/locations/states",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // "Authorization": "Bearer ${token}" // Dynamic token
    },
    // Map API response to dropdown options
    responseMapping: {
      value: "stateCode",      // API field for option value
      label: "stateName",      // API field for option label
      dataPath: "data.states"  // Path to array in response
    },
    // Optional: Pass form data as query params
    params: {
      country: "${country}"  // Reference to another field value
    },
    // Cache configuration
    cache: {
      enabled: true,
      duration: 3600000  // 1 hour in ms
    },
    // Loading state
    loadingText: "Loading states...",
    // Error handling
    errorText: "Failed to load states",
    onError: "useDefault" // or "showError" or "retry"
  },
  
  // Fallback static options if API fails
  options: [
    { value: "default", label: "Select a state" }
  ]
}
```

### 2. **Dependent Dropdowns (Cascading)**

```javascript
{
  id: "district",
  type: "dropdown",
  label: "District",
  placeholder: "Select district",
  required: true,
  
  // Enable only when state is selected
  enabledIf: {
    field: "state",
    hasValue: true
  },
  
  // API call triggered when state changes
  api: {
    endpoint: "/api/locations/districts",
    method: "GET",
    params: {
      stateCode: "${state}"  // Pass selected state
    },
    responseMapping: {
      value: "districtCode",
      label: "districtName",
      dataPath: "data.districts"
    },
    // Trigger conditions
    triggerOn: {
      field: "state",
      onChange: true  // Reload when state changes
    }
  }
}
```

### 3. **API Actions on Buttons**

```javascript
{
  id: "verify_aadhaar",
  type: "button",
  label: "Verify Aadhaar",
  buttonLabel: "Verify Now",
  variant: "contained",
  icon: "fingerprint",
  
  // API configuration for button action
  api: {
    endpoint: "/api/kyc/verify-aadhaar",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "${apiKey}"
    },
    // Data to send (from form fields)
    body: {
      aadhaarNumber: "${aadhaar_number}",
      biometric: "${biometric_scan}",
      consent: "${kyc_consent}"
    },
    // Success handling
    onSuccess: {
      action: "updateFields",  // or "navigate" or "showMessage"
      fields: {
        "full_name": "response.data.name",
        "date_of_birth": "response.data.dob",
        "gender": "response.data.gender",
        "address": "response.data.address"
      },
      message: "Aadhaar verified successfully!",
      messageType: "success"
    },
    // Error handling
    onError: {
      action: "showMessage",
      message: "response.error.message",
      messageType: "error"
    },
    // Loading state
    loadingText: "Verifying...",
    disableOnLoading: true
  }
}
```

### 4. **Form Submit with API**

```javascript
{
  id: "customer_onboarding",
  title: "Customer Onboarding",
  description: "Complete your profile",
  
  // API configuration for form submission
  submitApi: {
    endpoint: "/api/customers/onboard",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${authToken}"
    },
    // Transform form data before sending
    transformRequest: (formData) => ({
      personalInfo: {
        name: formData.full_name,
        dob: formData.date_of_birth,
        gender: formData.gender
      },
      contact: {
        mobile: formData.mobile_number,
        email: formData.email
      },
      address: {
        line1: formData.address_line1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      }
    }),
    // Success handling
    onSuccess: {
      action: "navigate",
      path: "/success",
      message: "Onboarding completed successfully!",
      // Store response data
      storeResponse: {
        customerId: "response.data.customerId",
        applicationId: "response.data.applicationId"
      }
    },
    // Error handling
    onError: {
      action: "showErrors",
      fieldMapping: {
        "full_name": "response.errors.name",
        "mobile_number": "response.errors.mobile"
      },
      message: "Please fix the errors and try again"
    }
  },
  
  sections: [...]
}
```

### 5. **Search/Autocomplete with API**

```javascript
{
  id: "bank_branch",
  type: "autocomplete",
  label: "Bank Branch",
  placeholder: "Search branch by name or IFSC",
  required: true,
  
  api: {
    endpoint: "/api/banks/search-branches",
    method: "GET",
    params: {
      query: "${searchText}",  // User input
      bankName: "HDFC Bank",
      limit: 10
    },
    responseMapping: {
      value: "ifscCode",
      label: "branchName",
      subtitle: "ifscCode",  // Show IFSC as subtitle
      dataPath: "data.branches"
    },
    // Debounce search
    debounce: 500,  // Wait 500ms after typing
    minChars: 3,    // Minimum characters to trigger search
    loadingText: "Searching branches...",
    noResultsText: "No branches found"
  }
}
```

### 6. **File Upload with API**

```javascript
{
  id: "document_upload",
  type: "image_capture",
  label: "Upload Document",
  required: true,
  
  api: {
    endpoint: "/api/documents/upload",
    method: "POST",
    headers: {
      // File upload uses multipart/form-data automatically
    },
    // Additional form data
    formData: {
      documentType: "${document_type}",
      customerId: "${customer_id}"
    },
    onSuccess: {
      action: "updateFields",
      fields: {
        "document_url": "response.data.url",
        "document_id": "response.data.documentId"
      },
      message: "Document uploaded successfully"
    },
    onProgress: (progress) => {
      // Show upload progress
      console.log(`Upload progress: ${progress}%`);
    }
  }
}
```

### 7. **Conditional API Calls**

```javascript
{
  id: "loan_products",
  type: "dropdown",
  label: "Loan Product",
  required: true,
  
  api: {
    endpoint: "/api/loans/products",
    method: "GET",
    // Only call API when conditions are met
    condition: {
      field: "customer_type",
      equals: "agriculture"
    },
    params: {
      customerType: "${customer_type}",
      loanAmount: "${loan_amount}"
    },
    responseMapping: {
      value: "productCode",
      label: "productName",
      dataPath: "data.products"
    }
  }
}
```

### 8. **Validation with API**

```javascript
{
  id: "mobile_number",
  type: "tel",
  label: "Mobile Number",
  required: true,
  
  // Client-side validation
  validation: {
    pattern: "^[6-9]\\d{9}$",
    message: "Enter valid 10 digit mobile number"
  },
  
  // Server-side validation
  apiValidation: {
    endpoint: "/api/validate/mobile",
    method: "POST",
    body: {
      mobile: "${mobile_number}"
    },
    debounce: 1000,  // Wait 1s after typing
    onSuccess: {
      isValid: "response.data.isValid",
      message: "response.data.message"
    },
    validationMessage: {
      checking: "Checking availability...",
      valid: "Mobile number is available",
      invalid: "response.data.error"
    }
  }
}
```

## Complete Example Schema

```javascript
export const apiEnabledSchema = {
  id: "customer_kyc",
  title: "Customer KYC",
  description: "Complete your KYC process",
  
  // Global API configuration
  apiConfig: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": "web-app"
    },
    timeout: 30000,  // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Form submission API
  submitApi: {
    endpoint: "/api/kyc/submit",
    method: "POST",
    onSuccess: {
      action: "navigate",
      path: "/kyc/success"
    }
  },
  
  sections: [
    {
      id: "location_section",
      title: "Location Details",
      fields: [
        {
          id: "state",
          type: "dropdown",
          label: "State",
          required: true,
          api: {
            endpoint: "/api/locations/states",
            method: "GET",
            responseMapping: {
              value: "code",
              label: "name",
              dataPath: "data"
            }
          }
        },
        {
          id: "district",
          type: "dropdown",
          label: "District",
          required: true,
          enabledIf: {
            field: "state",
            hasValue: true
          },
          api: {
            endpoint: "/api/locations/districts",
            method: "GET",
            params: {
              stateCode: "${state}"
            },
            triggerOn: {
              field: "state",
              onChange: true
            },
            responseMapping: {
              value: "code",
              label: "name",
              dataPath: "data"
            }
          }
        },
        {
          id: "verify_location",
          type: "button",
          buttonLabel: "Verify Location",
          variant: "outlined",
          api: {
            endpoint: "/api/locations/verify",
            method: "POST",
            body: {
              state: "${state}",
              district: "${district}"
            },
            onSuccess: {
              action: "updateFields",
              fields: {
                "location_verified": "true"
              },
              message: "Location verified successfully"
            }
          }
        }
      ]
    }
  ]
};
```

## API Response Format

### Expected Response Structure

```javascript
// Success Response
{
  "success": true,
  "data": {
    "states": [
      { "code": "KA", "name": "Karnataka" },
      { "code": "MH", "name": "Maharashtra" }
    ]
  },
  "message": "Data fetched successfully"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid state code",
    "fields": {
      "state": "State code is required"
    }
  }
}
```

## Usage in DynamicFormRenderer

The renderer will need to handle:
1. API calls on field mount (for dropdowns)
2. API calls on field change (for dependent fields)
3. API calls on button click
4. API calls on form submit
5. Loading states
6. Error handling
7. Response mapping
8. Field updates from API responses

This provides a complete API integration system through JSON configuration!
