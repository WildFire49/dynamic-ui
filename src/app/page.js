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
import InputWithRecording from '../components/mui/InputWithRecording';
import AudioTranslationResponse from '../components/mui/AudioTranslationResponse';
import SchedulerResponse from '../components/mui/SchedulerResponse';
import ModernAudioPlayer from '../components/mui/ModernAudioPlayer';
import PDFNotificationPopup from '../components/mui/PDFNotificationPopup';
import IncentiveRulesResponse from '../components/mui/IncentiveRulesResponse';
import styles from '@/styles/Chat.module.scss';
import MifixLogo from '@/assets/Mifix.png';
import ConfirmationDialog from '@/components/mui/ConfirmationDialog';
import { API_BASE_URL, CHAT_ENDPOINT } from '@/lib/config';
import { uploadAudioFile, generateAudioFileName } from '../lib/audioUpload';
import VoiceWaveform from '../components/mui/VoiceWaveform';

export default function HomePage() {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [currentResponseData, setCurrentResponseData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [eventPollingInterval, setEventPollingInterval] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', message: '' });
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const [recordingTime, setRecordingTime] = useState(0);
  const [scheduledTasks, setScheduledTasks] = useState(new Map());
  const [activeJobIds, setActiveJobIds] = useState(new Set());
  const chatEndRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const taskPollingRef = useRef(null);
  const [pdfPopupOpen, setPdfPopupOpen] = useState(false);
  const [pdfPopupData, setPdfPopupData] = useState(null);

  const handleApiResponse = useCallback((data) => {
    console.log('API Response:', data);
    setIsTyping(false);

    if (data.conversation_id) {
      setConversationId(data.conversation_id);
    }

    let botMessage = null;

    // New: Handle audio responses that also contain data (priority check)
    if (data.response?.access_url && data.response?.data) {
      botMessage = {
        type: 'audio_translation',
        content: {
          originalText: data.response.original_question || '',
          translatedText: data.response.question || data.response.translated_content,
          detectedLanguage: data.response.detected_language,
          audioUrl: data.response.access_url,
          status: data.response.status,
          errorMessage: data.response.error_message,
          data: data.response.data,
          rowCount: data.response.row_count,
          executionTime: data.response.execution_time_ms
        },
        isBot: true
      };
    }
    // Handle workflow modification response
    else if (data.response && data.response.status === 'preview_ready' && data.response.modification_request) {
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
        source: data.response.source || 'buddi_agent',
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
    // Handle audio-only responses (no data)
    else if (data.response?.access_url) {
      botMessage = {
        type: 'audio_translation',
        content: {
          originalText: data.response.original_question || '',
          translatedText: data.response.question || data.response.translated_content || data.response.content,
          detectedLanguage: data.response.detected_language,
          audioUrl: data.response.access_url,
          status: data.response.status || (data.response.type === 'error' ? 'error' : 'success'),
          errorMessage: data.response.error_message || (data.response.type === 'error' ? data.response.content : null),
          data: null, // Explicitly set data to null
        },
        isBot: true
      };
    }
    // Handle scheduler response
    else if (data.response?.type === 'scheduler_response') {
      botMessage = {
        type: 'scheduler_response',
        content: data.response,
        isBot: true
      };
      
      // Track scheduled tasks for automatic completion display
      if (data.response?.data?.job_id && data.response?.data?.schedule_details?.params?.run_date) {
        const jobId = data.response.data.job_id;
        const runDate = new Date(data.response.data.schedule_details.params.run_date);
        
        // Store job_id for tracking
        setActiveJobIds(prev => new Set([...prev, jobId]));
        
        setScheduledTasks(prev => {
          const newTasks = new Map(prev);
          newTasks.set(jobId, {
            runDate,
            title: data.response.content || 'Scheduled Task',
            conversationId: data.conversation_id
          });
          return newTasks;
        });
        
        // Fetch events data 2 minutes after scheduling
        setTimeout(async () => {
          try {
            const response = await fetch('http://15.207.209.61:8400/executor/events');
            if (response.ok) {
              const eventsData = await response.json();
              
              // Find event that matches any of our active job IDs
              if (eventsData && eventsData.length > 0) {
                const matchingEvent = eventsData.find(event => 
                  activeJobIds.has(event.id) && 
                  event.status === 'completed' && 
                  event.metadata?.response_type === 'downloadable_report'
                );
                
                if (matchingEvent) {
                  // Add completed message to chat
                  const completedMessage = {
                    type: 'scheduler_response',
                    content: matchingEvent,
                    isBot: true,
                    timestamp: new Date().toISOString()
                  };
                  
                  setChatHistory(prev => [...prev, completedMessage]);
                  
                  // Show PDF popup if download URL exists
                  if (matchingEvent.download_url) {
                    setPdfPopupData({
                      title: matchingEvent.title || data.response.content,
                      download_url: matchingEvent.download_url,
                      metadata: matchingEvent.metadata
                    });
                    setPdfPopupOpen(true);
                  }
                  
                  // Remove completed job ID from active tracking
                  setActiveJobIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(matchingEvent.id);
                    return newSet;
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error fetching events data:', error);
          }
          
          // Remove from scheduled tasks
          setScheduledTasks(prev => {
            const newTasks = new Map(prev);
            newTasks.delete(jobId);
            return newTasks;
          });
        }, 120000); // 2 minutes delay
      }
    }
    // Handle event API scheduler response
    else if (data.metadata?.response_type === 'downloadable_report') {
      botMessage = {
        type: 'scheduler_response',
        content: data,
        isBot: true
      };
      
      // Show PDF popup for completed downloadable reports
      if (data.status === 'completed' && data.download_url) {
        setPdfPopupData({
          title: data.title || 'Scheduled Report',
          download_url: data.download_url,
          metadata: data.metadata
        });
        setPdfPopupOpen(true);
      }
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
  }, [activeJobIds]);

  const callChatApi = useCallback(async (body) => {
    setIsTyping(true);
    try {
      const requestBody = { ...body };
      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }

      // Check if this is a configurator API call
      const isConfiguratorCall = body.message && body.message.includes('configurator');
      if (isConfiguratorCall) {
        setConfiguratorCallTime(Date.now());
      }

      const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat API Response:', data);
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
    const finalMessageText = String(messageText || inputValue || '');
    if (finalMessageText.trim() === '' && !audioKey) return;

    // Only add chat bubble if there's text message, not for audio-only
    if (finalMessageText.trim() !== '') {
      const userMessage = { type: 'user', content: { text: finalMessageText } };
      setChatHistory(prev => [...prev, userMessage]);
    }

    setInputValue('');

    const requestBody = {
      user_id: 'vaishakh_workflow1',
      message: finalMessageText,
    };

    // Add audio key if provided (instead of audio file)
    if (audioKey) {
      requestBody.key = audioKey;
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
            console.log('Audio uploaded successfully, key:', uploadResult.key);
            
            // Keep the local blob URL for playback, don't update to server URL
            // The VoiceWaveform component will use the local blob for playback
            
            // Send message with audio key only (no file URL)
            await handleSendMessage('', null, uploadResult.key);
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
  }, []);

  // PDF Popup handlers
  const handleClosePdfPopup = useCallback(() => {
    setPdfPopupOpen(false);
    setPdfPopupData(null);
  }, []);

  // Add these functions for scheduler task polling
  const startTaskPolling = useCallback(async (jobId) => {
    const pollTask = async () => {
      try {
        const response = await fetch(`http://15.207.209.61:8400/executor/events/scheduler/status/${jobId}`);
        if (response.ok) {
          const taskData = await response.json();
          
          // Check if task is completed and has results
          if (taskData.status === 'completed' && taskData.result) {
            const scheduledTask = scheduledTasks.get(jobId);
            
            // Create a new message for the completed task
            const completedMessage = {
              type: 'scheduler_response',
              content: {
                type: 'scheduler_response',
                content: `✅ Scheduled task "${scheduledTask?.title || 'Task'}" completed successfully!`,
                data: {
                  job_id: jobId,
                  status: 'completed',
                  result: taskData.result,
                  schedule_details: {
                    params: {
                      run_date: scheduledTask?.runDate?.toISOString()
                    }
                  }
                }
              },
              isBot: true,
              timestamp: new Date().toISOString()
            };
            
            // Add the completed task message to chat
            setMessages(prev => [...prev, completedMessage]);
            
            // Show PDF popup if there's a download URL
            if (taskData.result.pdf_url || taskData.result.download_url) {
              setPdfPopupData({
                title: scheduledTask?.title || 'Scheduled Task',
                download_url: taskData.result.pdf_url || taskData.result.download_url,
                metadata: {
                  data: taskData.result.data || taskData.result.tabular_data || [],
                  message: taskData.result.message || 'PDF generated successfully',
                  success: true
                }
              });
              setPdfPopupOpen(true);
            }
            
            // Remove from scheduled tasks and stop polling
            setScheduledTasks(prev => {
              const newTasks = new Map(prev);
              newTasks.delete(jobId);
              return newTasks;
            });
            
            clearInterval(taskPollingRef.current);
            taskPollingRef.current = null;
          }
        }
      } catch (error) {
        console.error('Error polling task status:', error);
      }
    };
    
    // Poll every 10 seconds
    taskPollingRef.current = setInterval(pollTask, 10000);
    
    // Also check immediately
    pollTask();
  }, [scheduledTasks]);

  const stopTaskPolling = useCallback(() => {
    if (taskPollingRef.current) {
      clearInterval(taskPollingRef.current);
      taskPollingRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setMediaRecorder(null);
    }
  }, [mediaRecorder, isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && isRecording && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
      // Pause the timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  }, [mediaRecorder, isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && isRecording && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
      // Resume the timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  }, [mediaRecorder, isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioChunks([]);
      setMediaRecorder(null);
      
      // Clear the timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Stop all tracks to release microphone
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
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

  const [configuratorCallTime, setConfiguratorCallTime] = useState(null);
  const [schedulerDelayTimeout, setSchedulerDelayTimeout] = useState(null);

  useEffect(() => {
    const pollEvents = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_EVENT_API_URL);
        if (response.ok) {
          const events = await response.json();
          if (events && events.length > 0) {
            // Only show scheduler events if 2 minutes have passed since configurator call
            const now = Date.now();
            if (configuratorCallTime && (now - configuratorCallTime) >= 120000) { // 2 minutes
              // Find events that match our active job IDs
              if (events && events.length > 0) {
                const matchingEvents = events.filter(event => 
                  activeJobIds.has(event.id) && 
                  event.status === 'completed' && 
                  event.metadata?.response_type === 'downloadable_report'
                );
                
                matchingEvents.forEach(event => {
                  handleApiResponse(event);
                  // Remove completed job ID from active tracking
                  setActiveJobIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(event.id);
                    return newSet;
                  });
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Event polling error:', error);
      }
    };

    // Start polling every 20 seconds
    const interval = setInterval(pollEvents, 20000);
    setEventPollingInterval(interval);

    // Cleanup on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [handleApiResponse, configuratorCallTime, activeJobIds]);

  useEffect(() => {
    return () => {
      if (eventPollingInterval) {
        clearInterval(eventPollingInterval);
      }
    };
  }, [eventPollingInterval]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);


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
                  ) : message.type === 'audio_translation' ? (
                    <AudioTranslationResponse 
                      content={message.content}
                    />
                  ) : message.type === 'scheduler_response' ? (
                    <SchedulerResponse 
                      content={message.content}
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
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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
          onPauseRecording={pauseRecording}
          onResumeRecording={resumeRecording}
          onCancelRecording={cancelRecording}
          isRecording={isRecording}
          isPaused={isPaused}
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
      <PDFNotificationPopup
        open={pdfPopupOpen}
        onClose={handleClosePdfPopup}
        data={pdfPopupData}
      />
    </Box>
  );
}
