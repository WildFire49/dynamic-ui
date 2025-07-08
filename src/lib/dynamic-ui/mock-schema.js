export const welcomeScreenSchema = {
  session_id: '57537a39-95b7-49cf-b163-822c50ed4bd1',
  response: {
    id: 'mobile-verification',
    ui_id: 'ui_mobile_verification_001',
    screen_id: 'mobile-verification',
    title: 'Mobile Verification Screen',
    components: [
      {
        id: 'input_mobile_number',
        type: 'input',
        label: 'Mobile Number',
        placeholder: 'Enter your 10-digit mobile number',
        inputType: 'number',
        validation: {
          required: true,
          format: '10-digit number',
        },
      },
      {
        id: 'input_password',
        type: 'input',
        label: 'Password',
        placeholder: 'Enter your password',
        inputType: 'password',
        validation: {
          required: true,
        },
      },
      {
        id: 'input_otp',
        type: 'input',
        label: 'One-Time Password',
        placeholder: 'Enter OTP',
        inputType: 'otp',
        length: 6,
        validation: {
          required: true,
        },
      },
      {
        id: 'input_loan_amount',
        type: 'input',
        label: 'Loan Amount',
        placeholder: 'Enter desired amount',
        inputType: 'amount',
        currencySymbol: '₹',
        validation: {
          required: true,
        },
      },
      {
        id: 'btn_verify',
        type: 'button',
        label: 'Verify',
        variant: 'contained',
        color: 'primary',
        sx: { mt: 2, py: 1.5 },
        action: 'api_mobile_verification_001',
      },
    ],
  },
};


