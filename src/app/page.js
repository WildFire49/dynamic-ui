"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DynamicRenderer from '@/lib/dynamic-ui/DynamicRenderer';
import { getUiSchema, getActionSchema } from '@/lib/theme/mock-schema';
import styles from '@/styles/Chat.module.scss';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import TypingIndicator from '@/components/mui/TypingIndicator';
import Zoom from '@mui/material/Zoom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Image from 'next/image';
import MifixLogo from '@/assets/Mifix.png';
import ConfirmationDialog from '@/components/mui/ConfirmationDialog';

const uiSchema = getUiSchema();
const actionSchema = getActionSchema();

export default function HomePage() {
  const [chatHistory, setChatHistory] = useState(() => {
    const welcomeScreen = uiSchema.find(screen => screen.id === 'ui_welcome_screen_001');
    return welcomeScreen ? [{ type: 'schema', content: welcomeScreen }] : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const chatEndRef = useRef(null);

  const proceedWithAction = useCallback((action) => {
    const nextActionId = action.next_success_action_id;
    if (!nextActionId) return;

    const nextAction = actionSchema.find(a => a.id === nextActionId);
    if (nextAction) {
      const nextScreen = uiSchema.find(s => s.id === nextAction.ui_id);
      if (nextScreen) {
        setIsTyping(true);
        setTimeout(() => {
          setChatHistory(prev => [...prev, { type: 'schema', content: nextScreen }]);
          setIsTyping(false);
        }, 1200);
      }
    }
  }, [setChatHistory, setIsTyping]);

  const handleAction = useCallback((actionId) => {
    if (!actionId) return;

    const action = actionSchema.find(a => a.id === actionId);
    if (!action) {
      console.error(`Action with ID ${actionId} not found.`);
      return;
    }

    if (action.confirmation) {
      setDialogConfig({
        title: action.confirmation.title,
        message: action.confirmation.message,
      });
      setActionToConfirm(() => () => proceedWithAction(action));
      setDialogOpen(true);
    } else {
      proceedWithAction(action);
    }
  }, [proceedWithAction]);

  const handleDialogClose = () => {
    setDialogOpen(false);
    setActionToConfirm(null);
  };

  const handleDialogConfirm = () => {
    if (typeof actionToConfirm === 'function') {
      actionToConfirm();
    }
    handleDialogClose();
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    const userMessage = { type: 'user', content: { text: inputValue } };
    setChatHistory(prev => [...prev, userMessage]);
    setInputValue('');
    // Future: Add logic to process user message and get a bot response
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <Image src={MifixLogo} alt="MiFiX AI Logo" width={32} height={32} style={{ marginRight: '12px' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 'bold' }}>
            MiFiX AI
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {chatHistory.map((message, index) => {
            const isUser = message.type === 'user';
            // Use a stable and unique key. For schema messages, the screen ID is perfect.
            // For user messages, we'll combine type and index for stability.
            const messageKey = message.type === 'schema' ? message.content.id : `user-${index}`;
            return (
              <Box key={messageKey} sx={{ alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                <Paper className={`${styles.chatBubble} ${isUser ? styles.user : styles.bot}`}>
                  {isUser ? (
                    <Typography>{message.content.text}</Typography>
                  ) : (
                    <DynamicRenderer schema={message.content} onAction={handleAction} />
                  )}
                </Paper>
              </Box>
            );
          })}
          {isTyping && (
            <Box sx={{ alignSelf: 'flex-start' }}>
                <Paper className={`${styles.chatBubble} ${styles.bot}`}>
                    <TypingIndicator />
                </Paper>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Stack>
      </Box>
      <Box sx={{ p: 2, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message here..."
            size="small"
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
          />
          <Zoom in={inputValue.trim().length > 0}>
            <IconButton
              color="primary"
              aria-label="send message"
              onClick={handleSendMessage}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <SendIcon />
            </IconButton>
          </Zoom>
        </Stack>
      </Box>
      <ConfirmationDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleConfirm={handleDialogConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
      />
    </Box>
  );
}
