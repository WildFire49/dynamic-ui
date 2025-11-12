/**
 * Customer Verification Panel Configuration
 * Master JSON structure for rendering the verification panel
 * Each customer has their own configuration
 */

export const customerVerificationPanelConfig = {
  // Customer: Arjun Patel
  "IL_HD_AH_305": {
    customer: {
      id: "IL_HD_AH_305",
      name: "Arjun Patel",
      overallStatus: "PENDING",
    },
    
    // Document Images for this customer
    documentImages: [
      {
        id: "doc_1",
        url: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400",
        label: "Profile Photo",
        type: "profile",
      },
      {
        id: "doc_2",
        url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        label: "Aadhaar Front",
        type: "aadhaar_front",
      },
      {
        id: "doc_3",
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        label: "Aadhaar Back",
        type: "aadhaar_back",
      },
      {
        id: "doc_4",
        url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
        label: "PAN Card",
        type: "pan",
      },
      {
        id: "doc_5",
        url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
        label: "Bank Statement",
        type: "bank_statement",
      },
      {
        id: "doc_6",
        url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400",
        label: "Land Documents",
        type: "land_docs",
      },
    ],

    // Sections with comment capability
    sections: [
      {
        id: "applicant_details",
        title: "Applicant Details",
        type: "data",
        allowComments: true,
        fields: [
          { id: "full_name", label: "Full Name", value: "Arjun Patel", status: "verified" },
          { id: "dob", label: "Date of Birth", value: "15/06/1985", status: "verified" },
          { id: "age", label: "Age", value: "38", status: "verified" },
        ],
      },
      {
        id: "kyc_address",
        title: "KYC Address",
        type: "data",
        allowComments: true,
        fields: [
          { id: "house_number", label: "House Number", value: "12-A", status: "verified" },
          { id: "street", label: "Street", value: "MG Road", status: "verified" },
        ],
      },
      {
        id: "bank_details",
        title: "Bank Details",
        type: "data",
        allowComments: true,
        fields: [
          { id: "bank_name", label: "Bank State", value: "Karnataka", status: "verified" },
          { id: "branch", label: "Bank City", value: "Bangalore", status: "verified" },
        ],
      },
      {
        id: "land_details",
        title: "Land Details",
        type: "data",
        allowComments: true,
        fields: [
          { id: "survey_number", label: "Survey Number", value: "123/4", status: "verified" },
          { id: "area", label: "Total Area", value: "2.5 Acres", status: "verified" },
        ],
      },
    ],

    // Verification stats
    stats: {
      totalFields: 9,
      verifiedFields: 9,
      pendingFields: 0,
    },

    // Internal review comments
    internalComments: [
      {
        id: "comment_1",
        category: "Customer Image",
        status: "approved",
        text: "Clear image of customer uploaded.",
        icon: "CheckCircle",
      },
    ],

    // Action buttons configuration
    actions: {
      approve: {
        label: "Approve",
        icon: "ThumbUp",
        color: "success",
        enabled: true,
      },
      reject: {
        label: "Reject",
        icon: "ThumbDown",
        color: "error",
        enabled: true,
      },
      sendBack: {
        label: "Send Back for Correction",
        icon: "Send",
        color: "primary",
        enabled: true,
      },
    },
  },

  // Customer: Ananya Gupta
  "AG_HD_DA_6969": {
    customer: {
      id: "AG_HD_DA_6969",
      name: "Ananya Gupta",
      overallStatus: "PENDING",
    },
    
    documentImages: [
      {
        id: "doc_1",
        url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        label: "Profile Photo",
        type: "profile",
      },
      {
        id: "doc_2",
        url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400",
        label: "Aadhaar Front",
        type: "aadhaar_front",
      },
      {
        id: "doc_3",
        url: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400",
        label: "Aadhaar Back",
        type: "aadhaar_back",
      },
      {
        id: "doc_4",
        url: "https://images.unsplash.com/photo-1554224311-beee0c923c15?w=400",
        label: "PAN Card",
        type: "pan",
      },
      {
        id: "doc_5",
        url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400",
        label: "Bank Statement",
        type: "bank_statement",
      },
      {
        id: "doc_6",
        url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
        label: "Land Documents",
        type: "land_docs",
      },
    ],

    sections: [
      {
        id: "applicant_details",
        title: "Applicant Details",
        type: "data",
        allowComments: true,
        fields: [
          { id: "full_name", label: "Full Name", value: "Ananya Gupta", status: "verified" },
          { id: "dob", label: "Date of Birth", value: "22/03/1990", status: "verified" },
          { id: "age", label: "Age", value: "35", status: "verified" },
        ],
      },
      {
        id: "kyc_address",
        title: "KYC Address",
        type: "data",
        allowComments: true,
        fields: [
          { id: "house_number", label: "House Number", value: "45-B", status: "verified" },
          { id: "street", label: "Street", value: "Residency Road", status: "verified" },
        ],
      },
      {
        id: "bank_details",
        title: "Bank Details",
        type: "data",
        allowComments: true,
        fields: [
          { id: "bank_name", label: "Bank State", value: "Karnataka", status: "verified" },
          { id: "branch", label: "Bank City", value: "Bangalore", status: "verified" },
        ],
      },
    ],

    stats: {
      totalFields: 7,
      verifiedFields: 7,
      pendingFields: 0,
    },

    internalComments: [
      {
        id: "comment_1",
        category: "Customer Image",
        status: "approved",
        text: "Clear image of customer uploaded.",
        icon: "CheckCircle",
      },
    ],

    actions: {
      approve: {
        label: "Approve",
        icon: "ThumbUp",
        color: "success",
        enabled: true,
      },
      reject: {
        label: "Reject",
        icon: "ThumbDown",
        color: "error",
        enabled: true,
      },
      sendBack: {
        label: "Send Back for Correction",
        icon: "Send",
        color: "primary",
        enabled: true,
      },
    },
  },

  // Default/Fallback configuration
  default: {
    customer: {
      id: "default",
      name: "Unknown Customer",
      overallStatus: "PENDING",
    },
    
    documentImages: [
      {
        id: "doc_1",
        url: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400",
        label: "Profile Photo",
        type: "profile",
      },
      {
        id: "doc_2",
        url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        label: "Aadhaar Front",
        type: "aadhaar_front",
      },
      {
        id: "doc_3",
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        label: "Aadhaar Back",
        type: "aadhaar_back",
      },
      {
        id: "doc_4",
        url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
        label: "PAN Card",
        type: "pan",
      },
    ],

    sections: [],
    
    stats: {
      totalFields: 0,
      verifiedFields: 0,
      pendingFields: 0,
    },

    internalComments: [],

    actions: {
      approve: {
        label: "Approve",
        icon: "ThumbUp",
        color: "success",
        enabled: true,
      },
      reject: {
        label: "Reject",
        icon: "ThumbDown",
        color: "error",
        enabled: true,
      },
      sendBack: {
        label: "Send Back for Correction",
        icon: "Send",
        color: "primary",
        enabled: true,
      },
    },
  },
};

/**
 * Get verification panel config for a specific customer
 * @param {string} customerId - Customer ID (e.g., "IL_HD_AH_305")
 * @returns {Object} Customer verification panel configuration
 */
export const getCustomerPanelConfig = (customerId) => {
  return customerVerificationPanelConfig[customerId] || customerVerificationPanelConfig.default;
};

export default customerVerificationPanelConfig;
