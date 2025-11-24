/**
 * Rajesh Kumar Verification Config
 * Comprehensive verification data for Rajesh Kumar across all 4 stages
 * ID Mapping:
 * 102: L1 Submitted (AG_HD_BG_102)
 * 103: L2 Submitted (AG_HD_BG_103)
 * 104: Bank Details (AG_HD_BG_104)
 * 105: eSign Pending (AG_HD_BG_105)
 */

const commonDocuments = [
  {
    id: "kyc_photo",
    label: "KYC Photo",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    status: "verified",
    confidence: 98,
    sectionId: "applicant_details",
  },
  {
    id: "aadhaar_front",
    label: "Aadhaar Front",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Aadhar_PVC_Front.jpg",
    status: "verified",
    confidence: 96,
    sectionId: "kyc_documents",
  },
  {
    id: "aadhaar_back",
    label: "Aadhaar Back",
    url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
    status: "verified",
    confidence: 94,
    sectionId: "kyc_documents",
  },
  {
    id: "pan_card",
    label: "PAN Card",
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
    status: "verified",
    confidence: 92,
    sectionId: "kyc_documents",
  },
  {
    id: "residence_photo",
    label: "Residence Photo",
    url: "https://c8.alamy.com/comp/EGBG08/madhya-pradesh-india-village-farmer-hut-home-in-the-middle-of-mustard-EGBG08.jpg",
    status: "verified",
    confidence: 90,
    sectionId: "current_address",
  },
];

const landDocuments = [
  {
    id: "land_record",
    label: "Land Record (RTC)",
    url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400",
    status: "verified",
    confidence: 95,
    sectionId: "land_details",
  },
  {
    id: "land_image",
    label: "Land Image",
    url: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400",
    status: "verified",
    confidence: 93,
    sectionId: "land_details",
  },
  {
    id: "field_photo_1",
    label: "Field Photo (North)",
    url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
    status: "verified",
    confidence: 88,
    sectionId: "crop_details",
  },
  {
    id: "field_photo_2",
    label: "Field Photo (Crop)",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
    status: "verified",
    confidence: 91,
    sectionId: "crop_details",
  },
  {
    id: "possession_certificate",
    label: "Possession Certificate",
    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
    status: "verified",
    confidence: 94,
    sectionId: "land_details",
  },
  {
    id: "encumbrance_certificate",
    label: "Encumbrance Certificate",
    url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
    status: "verified",
    confidence: 96,
    sectionId: "land_details",
  },
];

const bankDocuments = [
  {
    id: "bank_statement",
    label: "Bank Statement (6 Months)",
    url: "https://images.unsplash.com/photo-1554224155-6726b3ff0a77?w=400",
    status: "verified",
    confidence: 99,
    sectionId: "bank_details",
  },
  {
    id: "cancelled_cheque",
    label: "Cancelled Cheque",
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
    status: "verified",
    confidence: 97,
    sectionId: "bank_details",
  },
  {
    id: "bank_account_proof",
    label: "Bank Account Proof",
    url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400",
    status: "verified",
    confidence: 98,
    sectionId: "bank_details",
  },
];

// Section Definitions
const l1Sections = [
  {
    id: "applicant_details",
    title: "Applicant Details",
    subtitle: "Personal information verification",
    icon: "Person",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "full_name",
        label: "Full Name",
        value: "Rajesh Kumar",
        status: "verified",
        type: "text",
      },
      {
        id: "date_of_birth",
        label: "Date of Birth",
        value: "15/06/1985",
        status: "verified",
        type: "text",
        subValue: "38 years old",
      },
      {
        id: "age",
        label: "Age",
        value: "38",
        status: "verified",
        type: "text",
      },
      {
        id: "gender",
        label: "Gender",
        value: "Male",
        status: "verified",
        type: "text",
      },
      {
        id: "co_type",
        label: "C/O Type",
        value: "S/O",
        status: "verified",
        type: "text",
      },
      {
        id: "father_name",
        label: "Father's Name",
        value: "Mohan Kumar",
        status: "verified",
        type: "text",
      },
      {
        id: "mother_name",
        label: "Mother's Name",
        value: "Lakshmi Devi",
        status: "verified",
        type: "text",
      },
      {
        id: "prospect_ethnicity",
        label: "Ethnicity",
        value: "General",
        status: "verified",
        type: "text",
      },
      {
        id: "prospect_community",
        label: "Community",
        value: "Hindu",
        status: "verified",
        type: "text",
      },
      {
        id: "marital_status",
        label: "Marital Status",
        value: "Married",
        status: "verified",
        type: "text",
      },
      {
        id: "educational_qualification",
        label: "Educational Qualification",
        value: "Graduate",
        status: "verified",
        type: "text",
      },
      {
        id: "mobile_number",
        label: "Mobile Number",
        value: "9876543210",
        status: "verified",
        type: "text",
      },
    ],
  },
  {
    id: "kyc_address",
    title: "KYC Address",
    subtitle: "Address as per KYC documents",
    icon: "Home",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "kyc_house_number",
        label: "House Number",
        value: "12-A",
        status: "verified",
        type: "text",
      },
      {
        id: "kyc_street",
        label: "Street",
        value: "MG Road",
        status: "verified",
        type: "text",
      },
      {
        id: "kyc_locality",
        label: "Locality",
        value: "Gandhi Nagar",
        status: "verified",
        type: "text",
      },
      {
        id: "kyc_landmark",
        label: "Landmark",
        value: "Near Central Park",
        status: "verified",
        type: "text",
      },
      {
        id: "kyc_vtc",
        label: "VTC",
        value: "Bangalore Urban",
        status: "verified",
        type: "text",
      },
      {
        id: "kyc_state",
        label: "State",
        value: "Karnataka",
        status: "verified",
        type: "text",
      },
      {
        id: "kyc_district",
        label: "District",
        value: "Bangalore Urban",
        status: "verified",
        type: "text",
      },
      {
        id: "kyc_pin_code",
        label: "PIN Code",
        value: "560001",
        status: "verified",
        type: "text",
      },
    ],
  },
  {
    id: "current_address",
    title: "Current Address",
    subtitle: "Present residential address",
    icon: "Home",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "same_as_kyc",
        label: "Same as KYC Address",
        value: "Yes",
        status: "verified",
        type: "text",
      },
      {
        id: "current_house_number",
        label: "House Number",
        value: "12-A",
        status: "verified",
        type: "text",
      },
      {
        id: "current_street",
        label: "Street",
        value: "MG Road",
        status: "verified",
        type: "text",
      },
      {
        id: "current_locality",
        label: "Locality",
        value: "Gandhi Nagar",
        status: "verified",
        type: "text",
      },
      {
        id: "current_landmark",
        label: "Landmark",
        value: "Near Central Park",
        status: "verified",
        type: "text",
      },
      {
        id: "current_vtc",
        label: "VTC",
        value: "Bangalore Urban",
        status: "verified",
        type: "text",
      },
      {
        id: "current_state",
        label: "State",
        value: "Karnataka",
        status: "verified",
        type: "text",
      },
      {
        id: "current_district",
        label: "District",
        value: "Bangalore Urban",
        status: "verified",
        type: "text",
      },
      {
        id: "current_pin_code",
        label: "PIN Code",
        value: "560001",
        status: "verified",
        type: "text",
      },
      {
        id: "alternate_mobile_number",
        label: "Alternate Mobile",
        value: "+91 98765 43211",
        status: "verified",
        type: "text",
      },
    ],
  },
  {
    id: "bank_details_basic",
    title: "Bank Details (Basic)",
    subtitle: "Initial banking information",
    icon: "AccountBalance",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "bank_state",
        label: "Bank State",
        value: "Karnataka",
        status: "verified",
        type: "text",
      },
      {
        id: "bank_city",
        label: "Bank City",
        value: "Bangalore",
        status: "verified",
        type: "text",
      },
      {
        id: "sol_id",
        label: "SOL ID",
        value: "HDFC0001234",
        status: "verified",
        type: "text",
      },
      {
        id: "annual_income",
        label: "Annual Income",
        value: "₹5,00,000",
        status: "verified",
        type: "currency",
      },
    ],
  },
  {
    id: "kyc_documents",
    title: "KYC Documents",
    subtitle: "Identity verification documents",
    icon: "Description",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "kyc_type",
        label: "KYC Type",
        value: "Aadhaar",
        status: "verified",
        type: "text",
      },
      {
        id: "aadhaar_number",
        label: "Aadhaar Number",
        value: "XXXX XXXX 9012",
        status: "verified",
        type: "text",
      },
      {
        id: "pan_number",
        label: "PAN Number",
        value: "ABCDE1234F",
        status: "verified",
        type: "text",
      },
      {
        id: "category",
        label: "Category",
        value: "General",
        status: "verified",
        type: "text",
      },
    ],
  },
];

const l2Sections = [
  {
    id: "land_details",
    title: "Land Details",
    subtitle: "Property and land ownership",
    icon: "Terrain",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "survey_number",
        label: "Survey Number",
        value: "SV-123/456",
        status: "verified",
        type: "text",
      },
      {
        id: "land_area",
        label: "Land Area",
        value: "2.5 Acres",
        status: "verified",
        type: "text",
      },
      {
        id: "ownership_type",
        label: "Ownership",
        value: "Owned",
        status: "verified",
        type: "text",
      },
      {
        id: "land_type",
        label: "Land Type",
        value: "Irrigated",
        status: "verified",
        type: "text",
      },
      {
        id: "village",
        label: "Village",
        value: "Yelahanka",
        status: "verified",
        type: "text",
      },
      {
        id: "taluk",
        label: "Taluk",
        value: "Bangalore North",
        status: "verified",
        type: "text",
      },
    ],
  },
  {
    id: "crop_details",
    title: "Crop Details",
    subtitle: "Cultivation information",
    icon: "Agriculture",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "crop_name",
        label: "Crop Name",
        value: "Paddy",
        status: "verified",
        type: "text",
      },
      {
        id: "season",
        label: "Season",
        value: "Kharif",
        status: "verified",
        type: "text",
      },
      {
        id: "yield",
        label: "Estimated Yield",
        value: "3000 Quintals",
        status: "verified",
        type: "text",
      },
      {
        id: "scale_of_finance",
        label: "Scale of Finance",
        value: "₹45,000/Acre",
        status: "verified",
        type: "currency",
      },
    ],
  },
  {
    id: "loan_req",
    title: "Loan Requirements",
    subtitle: "Requested loan details",
    icon: "AttachMoney",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "loan_amount",
        label: "Loan Amount",
        value: "₹5,00,000",
        status: "verified",
        type: "currency",
      },
      {
        id: "purpose",
        label: "Purpose",
        value: "Crop Cultivation",
        status: "verified",
        type: "text",
      },
      {
        id: "tenure",
        label: "Tenure",
        value: "12 Months",
        status: "verified",
        type: "text",
      },
    ],
  },
];

const bankSections = [
  {
    id: "bank_details",
    title: "Bank Account",
    subtitle: "Disbursement account details",
    icon: "AccountBalance",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "account_holder",
        label: "Account Name",
        value: "Rajesh Kumar",
        status: "verified",
        type: "text",
      },
      {
        id: "bank_name",
        label: "Bank Name",
        value: "HDFC Bank",
        status: "verified",
        type: "text",
      },
      {
        id: "account_number",
        label: "Account Number",
        value: "50100123456789",
        status: "verified",
        type: "text",
      },
      {
        id: "ifsc_code",
        label: "IFSC Code",
        value: "HDFC0001234",
        status: "verified",
        type: "text",
      },
      {
        id: "branch",
        label: "Branch",
        value: "MG Road, Bangalore",
        status: "verified",
        type: "text",
      },
    ],
  },
  {
    id: "field_verification",
    title: "Field Verification",
    subtitle: "FO Visit Report",
    icon: "AssignmentTurnedIn",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "fo_name",
        label: "Field Officer",
        value: "Priya Nair",
        status: "verified",
        type: "text",
      },
      {
        id: "visit_date",
        label: "Visit Date",
        value: "20/11/2024",
        status: "verified",
        type: "text",
      },
      {
        id: "location_match",
        label: "Location Match",
        value: "Yes",
        status: "verified",
        type: "text",
      },
      {
        id: "crop_verified",
        label: "Crop Verified",
        value: "Yes - Paddy standing crop observed",
        status: "verified",
        type: "text",
      },
      {
        id: "remarks",
        label: "Remarks",
        value:
          "Customer has good standing in community. Land details match records.",
        status: "verified",
        type: "longtext",
      },
    ],
  },
];

const esignSections = [
  {
    id: "loan_agreement",
    title: "Loan Agreement",
    subtitle: "Digital contract signing",
    icon: "Gavel",
    type: "data",
    allowComments: true,
    fields: [
      {
        id: "agreement_status",
        label: "Agreement Status",
        value: "Generated",
        status: "verified",
        type: "text",
      },
      {
        id: "terms_accepted",
        label: "Terms Accepted",
        value: "Yes",
        status: "verified",
        type: "text",
      },
      {
        id: "esign_consent",
        label: "eSign Consent",
        value: "Given via OTP",
        status: "verified",
        type: "text",
      },
      {
        id: "sanction_amount",
        label: "Sanctioned Amount",
        value: "₹5,00,000",
        status: "verified",
        type: "currency",
      },
      {
        id: "interest_rate",
        label: "Interest Rate",
        value: "7% p.a.",
        status: "verified",
        type: "text",
      },
    ],
  },
];

export const rajeshVerificationConfig = {
  customers: {
    // Stage 2: L1 Submitted
    AG_HD_BG_102: {
      customer: {
        name: "Rajesh Kumar",
        mifixId: "AG_HD_BG_102",
        product: "L1 Customer Onboarding",
        overallStatus: "in_progress",
        verificationProgress: { total: 5, completed: 5, pending: 0 },
      },
      documentImages: [...commonDocuments],
      sections: [...l1Sections],
    },

    // Stage 3: L2 Submitted
    AG_HD_BG_103: {
      customer: {
        name: "Rajesh Kumar",
        mifixId: "AG_HD_BG_103",
        product: "Kisan Credit Card Application",
        overallStatus: "in_progress",
        verificationProgress: { total: 8, completed: 8, pending: 0 },
      },
      documentImages: [...commonDocuments, ...landDocuments],
      sections: [...l1Sections, ...l2Sections],
    },

    // Stage 4: Bank Details Submitted
    AG_HD_BG_104: {
      customer: {
        name: "Rajesh Kumar",
        mifixId: "AG_HD_BG_104",
        product: "KCC - Bank Verification",
        overallStatus: "in_progress",
        verificationProgress: { total: 10, completed: 10, pending: 0 },
      },
      documentImages: [...commonDocuments, ...landDocuments, ...bankDocuments],
      sections: [...l1Sections, ...l2Sections, ...bankSections],
    },

    // Stage 5: eSign Pending
    AG_HD_BG_105: {
      customer: {
        name: "Rajesh Kumar",
        mifixId: "AG_HD_BG_105",
        product: "KCC - Final Approval",
        overallStatus: "approved",
        verificationProgress: { total: 11, completed: 11, pending: 0 },
      },
      documentImages: [...commonDocuments, ...landDocuments, ...bankDocuments],
      sections: [
        ...l1Sections,
        ...l2Sections,
        ...bankSections,
        ...esignSections,
      ],
    },
  },
};

export default rajeshVerificationConfig;
