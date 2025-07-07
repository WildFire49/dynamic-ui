export const welcomeScreenSchema = {
  id: 'ui_welcome_screen_001',
  sessionId: 'session_welcome_001',
  screenId: 'welcome_screen',
  ui_components: [
    {
      id: 'email_input',
      component_type: 'text_input',
      properties: {
        label: 'Email Address',
        name: 'email',
        variant: 'filled',
      },
    },
    {
      id: 'submit_button',
      component_type: 'button',
      properties: {
        label: 'Submit',
        variant: 'contained',
        color: 'primary',
      },
    },
  ],
};


