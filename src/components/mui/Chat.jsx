import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Paper, TextField, IconButton, Fade, Zoom } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { keyframes } from '@mui/system';

/**
 * MiFiX AI Chat component that matches the design in the screenshots
 * Displays chat messages with bot avatar and styled message bubbles
 */
// Message typing animation keyframes
const typingAnimation = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Message bubble pop animation
const popAnimation = keyframes`
  0% { transform: scale(0.8); }
  40% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Chat = (props) => {
  const {
    title = "MiFiX AI",
    initial_message = "Hello! I'm MiFiX AI, your intelligent assistant. How can I help you today?",
    avatar_url = "/mifix-logo.png", // Using the MiFiX logo as requested
    user_avatar_url = "/ai-chatbot.png", // User avatar icon as requested
    background_color,
    chat_responses = [],
    ...otherProps
  } = props;
  
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Initialize messages from props or default
  useEffect(() => {
    const initialMessages = chat_responses.length > 0 ? chat_responses : [
      { role: 'bot', content: initial_message }
    ];
    setMessages(initialMessages);
  }, [chat_responses, initial_message]);
  
  // Function to handle input changes
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };
  
  // Function to handle sending a message
  const handleSendMessage = () => {
    if (userInput.trim() === '') return;
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userInput,
      animated: true // Flag for animation
    };
    
    setMessages([...messages, newUserMessage]);
    
    // Simulated bot response (for demo purposes)
    setTimeout(() => {
      const botResponse = {
        role: 'bot',
        content: 'I understand your message. How else can I help?',
        animated: true
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
    
    // Clear the input field after sending
    setUserInput('');
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle enter key press in the input field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // No longer needed - moved to useEffect initialization

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: background_color || 'background.default',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header with MiFiX logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          bgcolor: '#ffffff',
        }}
      >
        <Avatar 
          src={avatar_url} 
          alt="MiFiX AI"
          sx={{ width: 32, height: 32, mr: 1.5 }}
        />
        <Typography variant="h6" fontWeight="600" color="primary.main">
          {title}
        </Typography>
      </Box>
      {/* Chat messages container */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message, index) => {
          const isBot = message.role === 'bot';
          
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 2,
                alignSelf: isBot ? 'flex-start' : 'flex-end',
              }}
            >
              {isBot ? (
                <Avatar
                  src={avatar_url}
                  sx={{
                    width: 36, 
                    height: 36,
                    mr: 1,
                    bgcolor: 'primary.main',
                  }}
                >
                  {/* Fallback if avatar image fails to load */}
                  <Typography variant="body2" color="white">AI</Typography>
                </Avatar>
              ) : (
                <Avatar
                  src={user_avatar_url}
                  sx={{
                    width: 36, 
                    height: 36,
                    ml: 1,
                    order: 2,
                    bgcolor: 'background.chat.user',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">You</Typography>
                </Avatar>
              )}
              
              <Zoom 
                in={true} 
                style={{ 
                  transitionDelay: message.animated ? '100ms' : '0ms',
                  animationDuration: '0.5s',
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: isBot ? '70%' : '80%',
                    minWidth: '120px',
                    borderRadius: isBot ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                    bgcolor: isBot ? 'background.chat.bot' : 'background.chat.user',
                    color: isBot ? 'text.bot' : 'text.user',
                    animation: message.animated ? 
                      `${popAnimation} 0.3s ease-out` : 'none',
                    whiteSpace: isBot ? 'normal' : 'nowrap',  // Single line for user messages
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
                    },
                    order: isBot ? 0 : 1,
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{
                      animation: message.animated ? 
                        `${typingAnimation} 0.5s ease-out` : 'none',
                    }}
                  >
                    {message.content}
                  </Typography>
                </Paper>
              </Zoom>
            </Box>
          );
        })}
      </Box>
      
      {/* Input area */}
      <div ref={messagesEndRef} />
      
      <Box
        component="form"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message here..."
          variant="outlined"
          size="small"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              paddingRight: 1,
            },
          }}
          InputProps={{
            endAdornment: (
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                sx={{ p: '8px' }}
              >
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

export default Chat;
