"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Stack,
  AppBar,
  Toolbar,
  Grid,
  CircularProgress,
  Button
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import TypingIndicator from '@/components/mui/TypingIndicator';
import Zoom from '@mui/material/Zoom';
import DynamicRenderer from '../lib/dynamic-ui/DynamicRenderer';
import DataTable from '../components/mui/DataTable';
import WorkflowModifier from '../components/WorkflowModifier';
import DynamicDataVisualization from '../components/mui/DynamicDataVisualization';
import AnalysisResponse from '../components/mui/AnalysisResponse';
import IncentiveRulesResponse from '../components/mui/IncentiveRulesResponse';
import styles from '@/styles/Chat.module.scss';
import MifixLogo from '@/assets/Mifix.png';
import ConfirmationDialog from '@/components/mui/ConfirmationDialog';
import { API_BASE_URL, CHAT_ENDPOINT } from '@/lib/config';
import { uploadAudioFile, generateAudioFileName } from '../lib/audioUpload';
import InputWithRecording from '../components/mui/InputWithRecording';
import VoiceWaveform from '../components/mui/VoiceWaveform';

export default function HomePage() {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentResponseData, setCurrentResponseData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const chatEndRef = useRef(null);
  const recordingTimerRef = useRef(null);

  const handleApiResponse = useCallback((data) => {
    console.log('API Response:', data);
    setIsTyping(false);

    if (data.conversation_id) {
      setConversationId(data.conversation_id);
    }

    let botMessage = null;

    // Handle workflow modification response
    if (data.response && data.response.status === 'preview_ready' && data.response.modification_request) {
      botMessage = {
        type: 'system',
        content: 'Workflow Modification Preview',
        timestamp: new Date().toISOString(),
        workflow_modification: data.response,
      };
    }
    // Handle weather response
    else if (data.response && data.response.result && data.response.result.temperature) {
      const weatherData = data.response.result;
      botMessage = {
        type: 'system',
        content: 'Current Weather Information',
        timestamp: new Date().toISOString(),
        weather: weatherData,
      };
    }
    // Handle workflow response with UI schema
    else if (data.response?.ui_schema) {
      setCurrentResponseData(data.response);
      
      if (data.response.session_id) {
        setSessionId(data.response.session_id);
      }
      
      botMessage = {
        type: 'system',
        content: data.response.message || 'System response',
        timestamp: new Date().toISOString(),
        ui_schema: data.response.ui_schema,
      };
    }
    // Handle credit analysis response
    else if (data.response?.result?.response) {
      const analysisData = data.response.result.response;
      let analysisText = `**Credit Analysis Result**\n\n`;
      analysisText += `**Status:** ${analysisData.status?.toUpperCase() || 'N/A'}\n`;
      analysisText += `**Comments:** ${analysisData.comments || 'N/A'}\n`;
      analysisText += `**Credit History Type:** ${analysisData.creditHistoryType || 'N/A'}\n\n`;
      
      if (analysisData.summary && Array.isArray(analysisData.summary)) {
        analysisText += `**Conditions Summary:**\n`;
        analysisData.summary.forEach((condition, index) => {
          analysisText += `${index + 1}. **${condition.name}**: ${condition.status?.toUpperCase() || 'N/A'}\n`;
          analysisText += `   ${condition.description || ''}\n`;
          if (condition.reason && condition.reason.length > 0) {
            analysisText += `   Reason: ${condition.reason[0]}\n`;
          }
          analysisText += `\n`;
        });
      }
      botMessage = { type: 'user', content: { text: analysisText }, isBot: true };
    }
    // Handle dynamic data visualization response (supports any data structure)
    else if (
      (data.response?.status === 'success' && Array.isArray(data.response.data) && data.response.data.length > 0) ||
      (data?.status === 'success' && Array.isArray(data.data) && data.data.length > 0)
    ) {
      botMessage = {
        type: 'dynamic_data',
        isBot: true,
        content: {
          data: data.response?.data || data.data,
          question: data.response?.question || data.question || 'Data Analysis',
          title: 'Business Intelligence Dashboard'
        }
      };
    }
    // Handle table data response
    else if (data.response?.result && Array.isArray(data.response.result)) {
      botMessage = { 
        type: 'table', 
        content: { data: data.response.result, title: 'Query Results' }, 
        isBot: true 
      };
    }
    // Handle analysis response
    else if (data.response?.type === 'analysis' && data.response?.content) {
      botMessage = {
        type: 'analysis',
        content: data.response.content,
        source: data.response.source,
        isBot: true
      };
    }
    // Handle incentive rules response
    else if (data.response?.type === 'incentive_rules' && data.response?.content) {
      botMessage = {
        type: 'incentive_rules',
        content: data.response.content,
        source: data.response.source,
        isBot: true
      };
    }
    // Handle simple message response
    else if (data.response?.message) {
      botMessage = { 
        type: 'user', 
        content: { text: data.response.message }, 
        isBot: true 
      };
    }

    if (botMessage) {
      setChatHistory(prev => [...prev, botMessage]);
    }
  }, []);

  const callChatApi = useCallback(async (body) => {
    setIsTyping(true);
    try {
      const requestBody = { ...body };
      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }

      const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      handleApiResponse(data);

    } catch (error) {
      console.error('Error calling chat API:', error);
      const errorMessage = { type: 'user', content: { text: `Error: ${error.message}` }, isBot: true, isError: true };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [conversationId, handleApiResponse]);

  const handleAction = useCallback(async (action, componentId, data = {}) => {
    console.log('UI Action triggered:', { action, componentId, data });

    // Ignore OTP change events - they should not trigger automatic form submission
    if (data.type === 'otp_change') {
      console.log('OTP change detected, not triggering form submission');
      return;
    }

    let requestBody;
    if (action.payload) {
      // Case 1: Action has a direct payload
      requestBody = { ...action.payload };
      console.log('Sending custom payload request:', requestBody);

    } else if (action.type === 'submit_form') {
      // Case 2: Action is a form submission
      const details = {
        current_action_id: action.action_id,
        session_id: sessionId,
        customer_id: currentResponseData?.session_data?.customer_id,
        form_data: data,
      };
      requestBody = {
        user_id: 'vaishakh_workflow1',
        message: `continue ${JSON.stringify(details)}`,
        conversation_id: conversationId,
      };
      console.log('Sending form submission request:', requestBody);

    } else {
      // Case 3: All other actions (e.g., navigate_to) - use new continue format
      const details = {
        current_action_id: action.action_id,
        session_id: sessionId,
        customer_id: currentResponseData?.session_data?.customer_id,
        form_data: data,
      };
      requestBody = {
        user_id: 'vaishakh_workflow1',
        message: `continue ${JSON.stringify(details)}`,
        conversation_id: conversationId,
      };
      console.log('Sending navigation request:', requestBody);
    }
    
    await callChatApi(requestBody);
  }, [currentResponseData, callChatApi, conversationId, sessionId]);

  const handleSendMessage = useCallback(async (messageText = null, audioFileUrl = null, audioKey = null) => {
    const finalMessageText = messageText || inputValue;
    if (finalMessageText.trim() === '' && !audioFileUrl) return;

    const userMessage = { type: 'user', content: { text: finalMessageText } };
    setChatHistory(prev => [...prev, userMessage]);

    setInputValue('');

    const requestBody = {
      user_id: 'vaishakh_workflow1',
      message: finalMessageText,
    };

    // Add audio parameters if provided
    if (audioFileUrl) {
      requestBody.audio_file = audioFileUrl;
    }
    if (audioKey) {
      requestBody.audioKey = audioKey;
    }

    await callChatApi(requestBody);
  }, [inputValue, callChatApi]);

  const startRecording = useCallback(async (event) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      setRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        // Try different audio formats for better browser compatibility
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        const fileName = generateAudioFileName();
        
        // Use recorded time directly as duration (most reliable approach)
        const calculatedDuration = recordingTime;
        console.log('Using recording duration:', calculatedDuration, 'seconds');
        
        // Create local blob URL as fallback for immediate playback
        const localBlobUrl = URL.createObjectURL(audioBlob);
        console.log('Created local blob URL:', localBlobUrl);
        console.log('Audio blob size:', audioBlob.size, 'bytes');
        console.log('Audio blob type:', audioBlob.type);
        
        // Add voice message to chat history with local blob URL and duration
        const voiceMessage = { 
          type: 'user', 
          content: { 
            text: '', 
            audio_file: localBlobUrl,
            fileName: fileName,
            isLocalBlob: true,
            duration: calculatedDuration
          } 
        };
        setChatHistory(prev => [...prev, voiceMessage]);
        
        // Upload audio file in background
        try {
          const uploadResult = await uploadAudioFile(audioBlob, fileName);
          
          if (uploadResult.success && !uploadResult.isLocal) {
            console.log('Audio uploaded successfully:', uploadResult.fileUrl);
            
            // Test if the server URL is accessible before replacing local blob
            try {
              const testResponse = await fetch(uploadResult.fileUrl, { method: 'HEAD' });
              if (testResponse.ok) {
                // Update the message with the server URL only if it's accessible
                setChatHistory(prev => 
                  prev.map(msg => 
                    msg === voiceMessage 
                      ? { ...msg, content: { ...msg.content, audio_file: uploadResult.fileUrl, isLocalBlob: false } }
                      : msg
                  )
                );
              } else {
                console.warn('Server URL not accessible, keeping local blob URL');
              }
            } catch (testError) {
              console.warn('Could not test server URL accessibility, keeping local blob URL');
            }
            
            // Send message with audio file URL and audioKey
            await handleSendMessage('', uploadResult.fileUrl, uploadResult.audioKey);
          } else {
            console.error('Failed to upload audio:', uploadResult.error);
            // Keep the local blob URL if upload fails
          }
        } catch (error) {
          console.error('Error during audio upload:', error);
          // Keep the local blob URL if upload fails
        }
        
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [handleSendMessage, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, isRecording]);

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
      <AppBar position="static" sx={{ 
        backgroundColor: '#ffffff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '14px',
                color: '#1976d2',
                borderColor: '#e0e0e0',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#1976d2'
                }
              }}
            >
              New Chat
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              backgroundColor: '#f8f9fa',
              borderRadius: 3,
              px: 2,
              py: 1
            }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Image 
                  src="/ai-chatbot.png" 
                  alt="MiFiX AI" 
                  width={40} 
                  height={40} 
                  style={{ borderRadius: '50%' }}
                />
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  backgroundColor: '#4caf50',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />
              </Box>
              <Box>
                <Typography sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '16px',
                  color: '#1976d2',
                  lineHeight: 1.2
                }}>
                  MiFiX AI
                </Typography>
                <Typography sx={{ 
                  fontSize: '12px', 
                  color: '#4caf50',
                  lineHeight: 1
                }}>
                  Online
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        py: 2,
        px: 0,
        backgroundColor: '#f8f9fa',
        backgroundImage: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
          {chatHistory.length === 0 ? (
            // Welcome Screen
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '60vh',
              px: 3,
              textAlign: 'center'
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                overflow: 'hidden'
              }}>
                <Image 
                  src="/ai-chatbot.png" 
                  alt="MiFiX AI" 
                  width={80} 
                  height={80} 
                  style={{ borderRadius: '50%' }}
                />
              </Box>
              
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: '#1976d2',
                mb: 2
              }}>
                Welcome to MiFiX AI
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: '#6c757d',
                mb: 4,
                maxWidth: '400px',
                lineHeight: 1.6
              }}>
                I&apos;m here to help you with any questions or queries you might have. Feel free to ask me anything!
              </Typography>
              
              <Paper sx={{ 
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 3,
                p: 2,
                maxWidth: '350px',
                position: 'relative'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    <Image 
                      src="/ai-chatbot.png" 
                      alt="MiFiX AI" 
                      width={32} 
                      height={32} 
                      style={{ borderRadius: '50%' }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#495057' }}>
                    Hello! I&apos;m MiFiX AI, your intelligent assistant. How can I help you today?
                  </Typography>
                </Box>
                <Box sx={{
                  position: 'absolute',
                  top: '20px',
                  left: '-8px',
                  width: 0,
                  height: 0,
                  borderRight: '8px solid #f8f9fa',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent'
                }} />
              </Paper>
            </Box>
          ) : (
            chatHistory.map((message, index) => {
            const isUser = message.type === 'user' && !message.isBot;
            const isBot = message.isBot || message.type === 'schema' || message.type === 'table';
            const isError = message.isError;
            
            // Use a stable key based on message content and index to prevent bouncing
            const messageKey = message.type === 'schema' 
              ? `schema-${message.content.id}-${index}` 
              : message.type === 'table'
              ? `table-${index}-${message.content.data?.length || 0}`
              : `message-${index}`;
            
            return (
              <Box 
                key={messageKey} 
                sx={{ 
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  mb: 2,
                  px: { xs: 1, sm: 2 }
                }}
              >
                <Paper 
                  elevation={1}
                  sx={{
                    maxWidth: { xs: '85%', sm: '70%', md: '60%' },
                    minWidth: '120px',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: isUser 
                      ? '#1976d2' 
                      : isError 
                      ? '#ffebee' 
                      : '#f5f5f5',
                    color: isUser ? '#ffffff' : 'inherit',
                    border: isError ? '1px solid #f44336' : 'none',
                    position: 'relative',
                    '&::before': isUser ? {
                      content: '""',
                      position: 'absolute',
                      top: '10px',
                      right: '-8px',
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid #1976d2',
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent'
                    } : {
                      content: '""',
                      position: 'absolute',
                      top: '10px',
                      left: '-8px',
                      width: 0,
                      height: 0,
                      borderRight: `8px solid ${isError ? '#ffebee' : '#f5f5f5'}`,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent'
                    }
                  }}
                >
                  {message.type === 'schema' ? (
                    <DynamicRenderer schema={message.content} onAction={handleAction} />
                  ) : message.type === 'system' && message.ui_schema ? (
                    <DynamicRenderer
                      key={`dynamic-${index}`}
                      schema={message.ui_schema}
                      onAction={handleAction}
                    />
                  ) : message.type === 'system' && message.weather ? (
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#f5f5f5', maxWidth: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                        Weather Information - {message.weather.location}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body1"><strong>Temperature:</strong> {message.weather.temperature}</Typography>
                          <Typography variant="body1"><strong>Feels Like:</strong> {message.weather.feels_like}</Typography>
                          <Typography variant="body1"><strong>Description:</strong> {message.weather.description}</Typography>
                          <Typography variant="body1"><strong>Humidity:</strong> {message.weather.humidity}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1"><strong>Wind Speed:</strong> {message.weather.wind_speed}</Typography>
                          <Typography variant="body1"><strong>Pressure:</strong> {message.weather.pressure}</Typography>
                          <Typography variant="body1"><strong>Visibility:</strong> {message.weather.visibility}</Typography>
                          <Typography variant="body1"><strong>Cloudiness:</strong> {message.weather.cloudiness}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : message.type === 'dynamic_data' ? (
                    <Box sx={{ width: '100%', maxWidth: 'none' }}>
                      <DynamicDataVisualization
                        data={message.content.data}
                        question={message.content.question}
                        title={message.content.title}
                      />
                    </Box>
                  ) : message.type === 'system' && message.workflow_modification ? (
                    <WorkflowModifier 
                      data={{ response: message.workflow_modification }}
                      onConfirm={() => {
                        // Send confirmation to backend
                        const confirmPayload = {
                          user_id: 'vaishakh_workflow1',
                          message: 'confirm',
                          conversation_id: conversationId
                        };
                        callChatApi(confirmPayload);
                      }}
                      onCancel={() => {
                        // Send cancellation to backend
                        const cancelPayload = {
                          user_id: 'vaishakh_workflow1',
                          message: 'cancel',
                          conversation_id: conversationId
                        };
                        callChatApi(cancelPayload);
                      }}
                    />
                  ) : message.type === 'analysis' ? (
                    <AnalysisResponse 
                      data={message.content} 
                      source={message.source}
                    />
                  ) : message.type === 'incentive_rules' ? (
                    <IncentiveRulesResponse 
                      data={message.content} 
                      source={message.source}
                    />
                  ) : message.type === 'table' ? (
                    <Box sx={{ width: '100%', overflow: 'hidden' }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        {message.content.title || 'Results'}
                      </Typography>
                      <DataTable data={message.content.data} />
                    </Box>
                  ) : message.content.audio_file ? (
                    <VoiceWaveform 
                      audioUrl={message.content.audio_file}
                      fileName={message.content.fileName || 'Voice Message'}
                      duration={message.content.duration || 0}
                    />
                  ) : message.content.text ? (
                    <Typography 
                      variant="body1"
                      sx={{ 
                        color: isUser ? '#ffffff' : isError ? '#d32f2f' : 'inherit',
                        wordBreak: 'break-word',
                        lineHeight: 1.4
                      }}
                    >
                      {message.content.text}
                    </Typography>
                  ) : null}
                </Paper>
              </Box>
            );
          })
          )}
          {isTyping && (
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 2,
                px: { xs: 1, sm: 2 }
              }}
            >
              <Paper 
                elevation={1}
                sx={{
                  maxWidth: { xs: '85%', sm: '70%', md: '60%' },
                  minWidth: '120px',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#f5f5f5',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '10px',
                    left: '-8px',
                    width: 0,
                    height: 0,
                    borderRight: '8px solid #f5f5f5',
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent'
                  }
                }}
              >
                <TypingIndicator />
              </Paper>
            </Box>
          )}
        </Box>
        <div ref={chatEndRef} />
      </Box>
      <Box sx={{ 
        p: 1, 
        backgroundColor: '#ffffff', 
        borderTop: '1px solid #e9ecef'
      }}>
        <InputWithRecording
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          onSendMessage={handleSendMessage}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          isRecording={isRecording}
          recordingTime={recordingTime}
          isTyping={isTyping}
        />
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
