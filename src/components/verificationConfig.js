/**
 * Verification Configuration
 * JSON structure for customer data verification
 * Used for web-based validation of mobile-captured data
 */

import { rajeshVerificationConfig } from "./rajeshVerificationConfig";

export const verificationConfig = {
  // Mock S3 URLs for images
  mockImages: {
    customerPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    addressProof1:
      "https://images.unsplash.com/photo-1554224311-beee1c7c3c39?w=400",
    addressProof2:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
    landPhoto1:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
    landPhoto2:
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400",
    bankPassbook:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400",
    signature:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
  },

  // Sample verification data for different customers
  customers: {
    ...rajeshVerificationConfig.customers,
    IL_HD_AH_305: {
      customer: {
        name: "Arjun Patel",
        mifixId: "IL_HD_AH_305",
        product: "Individual Loan",
        amount: "₹28,50,000",
        overallStatus: "pending",
      },
      sections: [
        {
          id: "personal_info",
          title: "Personal Information",
          subtitle: "Basic customer details",
          icon: "Person",
          type: "data",
          fields: [
            {
              id: "full_name",
              label: "Full Name",
              value: "Arjun Patel",
              status: "verified",
            },
            {
              id: "mobile",
              label: "Mobile Number",
              value: "+91 98765 12345",
              status: "verified",
            },
            {
              id: "email",
              label: "Email Address",
              value: "arjun.patel@example.com",
              status: "verified",
            },
          ],
        },
        {
          id: "documents",
          title: "Document Images",
          subtitle: "Uploaded documents and photos",
          icon: "Description",
          type: "images",
          fields: [
            {
              id: "customer_photo",
              label: "Customer Photo",
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
              status: "verified",
            },
            {
              id: "address_proof",
              label: "Address Proof",
              url: "https://images.unsplash.com/photo-1554224311-beee1c7c3c39?w=400",
              status: "pending",
            },
          ],
        },
      ],
    },
    JL_HD_JP_507: {
      customer: {
        name: "Devanshi Mehta",
        mifixId: "JL_HD_JP_507",
        product: "Joint Liability Loan",
        amount: "₹45,00,000",
        overallStatus: "pending",
      },
      sections: [
        {
          id: "personal_info",
          title: "Personal Information",
          subtitle: "Basic customer details",
          icon: "Person",
          type: "data",
          fields: [
            {
              id: "full_name",
              label: "Full Name",
              value: "Devanshi Mehta",
              status: "verified",
            },
            {
              id: "father_name",
              label: "Father's Name",
              value: "Rajesh Mehta",
              status: "verified",
            },
            {
              id: "dob",
              label: "Date of Birth",
              value: "15/08/1985",
              subValue: "38 years old",
              status: "verified",
            },
            {
              id: "gender",
              label: "Gender",
              value: "Female",
              status: "verified",
            },
            {
              id: "mobile",
              label: "Mobile Number",
              value: "+91 98765 43210",
              status: "verified",
            },
            {
              id: "email",
              label: "Email Address",
              value: "devanshi.mehta@example.com",
              status: "verified",
            },
            {
              id: "pan",
              label: "PAN Number",
              value: "ABCDE1234F",
              status: "verified",
            },
            {
              id: "aadhaar",
              label: "Aadhaar Number",
              value: "XXXX XXXX 5678",
              status: "verified",
            },
          ],
        },
        {
          id: "address_details",
          title: "Address Details",
          subtitle: "Current and permanent address",
          icon: "Home",
          type: "data",
          fields: [
            {
              id: "current_address",
              label: "Current Address",
              value: "H-27, Malviya Nagar, Jaipur - 302017",
              status: "verified",
            },
            {
              id: "address_kyc",
              label: "Address (KYC)",
              value:
                "NST House, Indira nagar, Bangalore, Near IHRD College, Bangalore Rural, Bangalore, Karnataka, 560068",
              status: "pending",
            },
            {
              id: "city",
              label: "City",
              value: "Jaipur",
              status: "verified",
            },
            {
              id: "state",
              label: "State",
              value: "Rajasthan",
              status: "verified",
            },
            {
              id: "pincode",
              label: "Pincode",
              value: "302017",
              status: "verified",
            },
            {
              id: "residence_type",
              label: "Residence Type",
              value: "Owned",
              status: "verified",
            },
          ],
        },
        {
          id: "land_details",
          title: "Land & Crop Details",
          subtitle: "Agriculture loan information",
          icon: "Business",
          type: "data",
          fields: [
            {
              id: "allied_loan",
              label: "Allied Loan",
              value: "Poultry",
              status: "verified",
            },
            {
              id: "state_land",
              label: "State",
              value: "Karnataka",
              status: "verified",
            },
            {
              id: "district",
              label: "District",
              value: "Bangalore Urban",
              status: "verified",
            },
            {
              id: "taluk",
              label: "Taluk",
              value: "Bangalore North",
              status: "verified",
            },
            {
              id: "village",
              label: "Village",
              value: "Yelahanka",
              status: "verified",
            },
            {
              id: "survey_number",
              label: "Survey Number",
              value: "SV-123/456",
              status: "verified",
            },
            {
              id: "sub_division",
              label: "Sub Division Number",
              value: "SD-01",
              status: "verified",
            },
            {
              id: "land_owner",
              label: "Land Owner Name",
              value: "Rajesh Kumar",
              status: "verified",
            },
            {
              id: "land_extent",
              label: "Land Extent (in hectares)",
              value: "2.5",
              status: "verified",
            },
            {
              id: "patta_number",
              label: "Patta No.",
              value: "PT-12345",
              status: "verified",
            },
            {
              id: "land_verified",
              label: "Land Record Verified",
              value: "Verified",
              status: "verified",
            },
          ],
        },
        {
          id: "bank_details",
          title: "Bank Details",
          subtitle: "Account information",
          icon: "AccountBalance",
          type: "data",
          fields: [
            {
              id: "bank_name",
              label: "Bank Name",
              value: "HDFC Bank",
              status: "verified",
            },
            {
              id: "branch",
              label: "Branch",
              value: "Malviya Nagar, Jaipur",
              status: "verified",
            },
            {
              id: "account_number",
              label: "Account Number",
              value: "XXXX XXXX 7890",
              status: "verified",
            },
            {
              id: "ifsc",
              label: "IFSC Code",
              value: "HDFC0001234",
              status: "verified",
            },
            {
              id: "account_type",
              label: "Account Type",
              value: "Savings",
              status: "verified",
            },
          ],
        },
        {
          id: "documents",
          title: "Document Images",
          subtitle: "Uploaded documents and photos",
          icon: "Description",
          type: "images",
          fields: [
            {
              id: "customer_photo",
              label: "Customer Photo (KYC)",
              url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
              status: "verified",
            },
            {
              id: "customer_recent",
              label: "Customer Recent Photo",
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
              status: "verified",
            },
            {
              id: "address_proof_1",
              label: "Address Proof 1",
              url: "https://images.unsplash.com/photo-1554224311-beee1c7c3c39?w=400",
              status: "pending",
            },
            {
              id: "address_proof_2",
              label: "Address Proof 2",
              url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
              status: "pending",
            },
            {
              id: "land_photo_1",
              label: "Land Photo 1",
              url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
              status: "verified",
            },
            {
              id: "land_photo_2",
              label: "Land Photo 2",
              url: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400",
              status: "verified",
            },
            {
              id: "bank_passbook",
              label: "Bank Passbook",
              url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400",
              status: "verified",
            },
            {
              id: "signature",
              label: "Customer Signature",
              url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
              status: "pending",
            },
          ],
        },
      ],
    },
    JL_HD_CH_912: {
      customer: {
        name: "Rajesh Kumar",
        mifixId: "JL_HD_CH_912",
        product: "Joint Liability Loan",
        amount: "₹92,00,000",
        overallStatus: "pending",
      },
      sections: [
        {
          id: "personal_info",
          title: "Personal Information",
          subtitle: "Basic customer details",
          icon: "Person",
          type: "data",
          fields: [
            {
              id: "full_name",
              label: "Full Name",
              value: "Rajesh Kumar",
              status: "verified",
            },
            {
              id: "father_name",
              label: "Father's Name",
              value: "Suresh Kumar",
              status: "verified",
            },
            {
              id: "dob",
              label: "Date of Birth",
              value: "20/05/1980",
              subValue: "43 years old",
              status: "verified",
            },
            {
              id: "gender",
              label: "Gender",
              value: "Male",
              status: "verified",
            },
            {
              id: "mobile",
              label: "Mobile Number",
              value: "+91 98781 23456",
              status: "verified",
            },
            {
              id: "email",
              label: "Email Address",
              value: "rajesh.kumar@example.in",
              status: "verified",
            },
          ],
        },
        {
          id: "address_details",
          title: "Address Details",
          subtitle: "Current and permanent address",
          icon: "Home",
          type: "data",
          fields: [
            {
              id: "current_address",
              label: "Current Address",
              value: "Plot 45, Industrial Area Phase 2, Chandigarh - 160002",
              status: "verified",
            },
            {
              id: "city",
              label: "City",
              value: "Chandigarh",
              status: "verified",
            },
            {
              id: "state",
              label: "State",
              value: "Chandigarh",
              status: "verified",
            },
          ],
        },
        {
          id: "documents",
          title: "Document Images",
          subtitle: "Uploaded documents and photos",
          icon: "Description",
          type: "images",
          fields: [
            {
              id: "customer_photo",
              label: "Customer Photo (KYC)",
              url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
              status: "verified",
            },
            {
              id: "address_proof_1",
              label: "Address Proof",
              url: "https://images.unsplash.com/photo-1554224311-beee1c7c3c39?w=400",
              status: "verified",
            },
          ],
        },
      ],
    },
  },
};

export default verificationConfig;
