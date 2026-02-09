
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Box, Typography, TextField, IconButton, Paper, Menu, MenuItem, ListItemIcon, ListItemText, Fade } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Send, AutoAwesome, AttachFile, Mic, AlternateEmail } from "@mui/icons-material";
import { AGENT_HIERARCHY } from '../agentData';
import { SupervisoryImage } from './AgentIcons';
import { THEME_DARK, THEME_LIGHT } from '../config/theme';
import { CHAT_CONFIG, HELP_CONTENT } from '../config/chatConfig';

/* ─── Styled Components ─── */

const MessagesArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'customcolors'
})(({ customcolors }) => ({
  flex: 1,
  overflowY: "auto",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  "@media (min-width: 600px)": {
    padding: "28px 40px",
  },
  "&::-webkit-scrollbar": { width: "5px" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(customcolors.primary, 0.15),
    borderRadius: "10px",
    "&:hover": { background: alpha(customcolors.primary, 0.25) },
  },
}));

const InputWrapper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'customcolors'
})(({ customcolors }) => ({
  background: customcolors.inputBg,
  backdropFilter: "blur(16px)",
  border: `1px solid ${customcolors.inputBorder}`,
  borderRadius: "20px",
  padding: "6px 12px",
  display: "flex",
  alignItems: "center",
  boxShadow: `0 2px 20px ${customcolors.shadowColor}`,
  transition: "all 0.25s ease",
  "&:focus-within": {
    borderColor: customcolors.primary,
    boxShadow: `0 0 0 3px ${alpha(customcolors.primary, 0.1)}, 0 2px 20px ${customcolors.shadowColor}`,
  },
  "@media (min-width: 600px)": {
    padding: "8px 16px",
    borderRadius: "24px",
  },
}));

const StyledInput = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'customcolors'
})(({ customcolors }) => ({
  flex: 1,
  "& .MuiInputBase-root": {
    color: customcolors.textBright,
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.95rem",
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
}));

const ProcessingDots = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'customcolors'
})(({ customcolors }) => ({
  display: "flex",
  gap: "5px",
  padding: "14px 20px",
  "& span": {
    width: "7px",
    height: "7px",
    background: customcolors.primary,
    borderRadius: "50%",
    animation: "dotBounce 1.4s infinite ease-in-out both",
  },
  "& span:nth-of-type(1)": { animationDelay: "-0.32s" },
  "& span:nth-of-type(2)": { animationDelay: "-0.16s" },
  "@keyframes dotBounce": {
    "0%, 80%, 100%": { transform: "scale(0)", opacity: 0.4 },
    "40%": { transform: "scale(1)", opacity: 1 },
  },
}));


/* ─── Component ─── */

const ChatInterface = ({ mode = 'dark' }) => {
  const themeColors = mode === 'light' ? THEME_LIGHT : THEME_DARK;
  const [messages, setMessages] = useState(CHAT_CONFIG.initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mention states
  const [mentionAnchor, setMentionAnchor] = useState(null);
  const [mentionQuery, setMentionQuery] = useState("");

  const allAgents = useMemo(() => {
    return Object.values(AGENT_HIERARCHY).flatMap(group => group.agents);
  }, []);

  const filteredAgents = useMemo(() => {
    if (!mentionQuery) return allAgents;
    return allAgents.filter(a =>
      a.title.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      a.id.includes(mentionQuery.toLowerCase())
    );
  }, [mentionQuery, allAgents]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    const activeWord = words[words.length - 1];

    if (activeWord.startsWith('@')) {
      setMentionQuery(activeWord.slice(1));
      setMentionAnchor(inputRef.current);
    } else {
      setMentionAnchor(null);
    }
  };

  const handleAgentSelect = (agent) => {
    const words = inputValue.split(/\s+/);
    words.pop();
    const newValue = [...words, `@${agent.title} `].join(" ");
    setInputValue(newValue);
    setMentionAnchor(null);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Slash commands
    if (inputValue.startsWith('/')) {
      const command = inputValue.toLowerCase().trim();
      const userMsg = { id: Date.now(), sender: "user", text: inputValue };
      setMessages(prev => [...prev, userMsg]);
      setInputValue("");

      setTimeout(() => {
        let responseText = "";

        switch (command) {
          case CHAT_CONFIG.commands.HELP:
            responseText = (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: themeColors.primary }}>
                  {HELP_CONTENT.title}
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'none' }}>
                  {HELP_CONTENT.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>
                      <Typography component="span" sx={{ fontFamily: 'monospace', color: themeColors.accent, fontWeight: 600, fontSize: '0.85rem' }}>
                        {item.cmd}
                      </Typography>
                      <Typography component="span" sx={{ color: themeColors.textDim, fontSize: '0.85rem' }}>
                        {' '}&mdash; {item.desc}
                      </Typography>
                    </li>
                  ))}
                </ul>
                <Typography variant="body2" sx={{ mt: 1.5, color: themeColors.textDim, fontSize: '0.8rem' }}>
                  {HELP_CONTENT.footer}
                </Typography>
              </Box>
            );
            break;
          case CHAT_CONFIG.commands.CLEAR:
            setMessages([{
              id: Date.now(),
              sender: "system",
              text: CHAT_CONFIG.systemResponses.clear
            }]);
            return;
          case CHAT_CONFIG.commands.AGENTS:
            const agentList = allAgents.map(a => a.title).join(", ");
            responseText = CHAT_CONFIG.systemResponses.agentsList(agentList);
            break;
          case CHAT_CONFIG.commands.STATUS:
            responseText = CHAT_CONFIG.systemResponses.status;
            break;
          default:
            responseText = CHAT_CONFIG.systemResponses.unknownCommand(command);
        }

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: "system",
          text: responseText
        }]);
      }, 300);
      return;
    }

    // Normal message
    const newMsg = { id: Date.now(), sender: "user", text: inputValue };
    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "system",
        text: CHAT_CONFIG.systemResponses.processing
      }]);
    }, 2000);
  };


  /* ─── Render ─── */

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <MessagesArea customcolors={themeColors}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
                // Stagger animation
                animation: 'msgFadeIn 0.3s ease-out',
                '@keyframes msgFadeIn': {
                  from: { opacity: 0, transform: `translateY(8px)` },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Box sx={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 1.5,
                maxWidth: { xs: '90%', sm: '80%', md: '70%' },
              }}>
                {/* Avatar */}
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: isUser
                    ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`
                    : alpha(themeColors.primary, 0.1),
                  border: isUser ? 'none' : `1px solid ${alpha(themeColors.primary, 0.15)}`,
                  mt: 0.25,
                }}>
                  {isUser ? (
                    <Box
                      component="img"
                      src="/manager-avatar.svg"
                      sx={{ width: '100%', height: '100%', borderRadius: '50%' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = '<span style="color:#fff;font-size:13px;font-weight:700">Y</span>';
                      }}
                    />
                  ) : (
                    <SupervisoryImage sx={{ width: '75%', height: '75%' }} />
                  )}
                </Box>

                {/* Content column */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  gap: 0.5,
                  minWidth: 0,
                }}>
                  {/* Sender label */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: themeColors.textDim,
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      px: 0.5,
                    }}
                  >
                    {isUser ? CHAT_CONFIG.labels.user : CHAT_CONFIG.labels.system}
                  </Typography>

                  {/* Message bubble - width: fit-content is the key fix */}
                  <Box sx={{
                    width: 'fit-content',
                    maxWidth: '100%',
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 1.25, sm: 1.5 },
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isUser ? themeColors.bubbleUserBg : themeColors.bubbleSysBg,
                    color: isUser ? themeColors.bubbleUserText : themeColors.bubbleSysText,
                    border: `1px solid ${isUser ? themeColors.bubbleUserBorder : themeColors.bubbleSysBorder}`,
                    boxShadow: isUser
                      ? `0 2px 12px ${alpha(themeColors.primary, 0.2)}`
                      : `0 1px 6px ${alpha('#000', mode === 'dark' ? 0.2 : 0.06)}`,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: isUser
                        ? `0 4px 16px ${alpha(themeColors.primary, 0.25)}`
                        : `0 2px 10px ${alpha('#000', mode === 'dark' ? 0.25 : 0.08)}`,
                    },
                    // Text wrapping
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}>
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{
                        lineHeight: 1.6,
                        fontFamily: '"Inter", sans-serif',
                        fontSize: { xs: '0.875rem', sm: '0.925rem' },
                        fontWeight: 400,
                        '& strong': { fontWeight: 600 },
                        '& code': {
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.8rem',
                          background: alpha(themeColors.primary, 0.1),
                          padding: '2px 6px',
                          borderRadius: '4px',
                        },
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* Processing indicator */}
        {isProcessing && (
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}>
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(themeColors.primary, 0.1),
              border: `1px solid ${alpha(themeColors.primary, 0.15)}`,
            }}>
              <SupervisoryImage sx={{ width: '75%', height: '75%' }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" sx={{
                color: themeColors.textDim,
                fontWeight: 600,
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                px: 0.5,
              }}>
                {CHAT_CONFIG.labels.system}
              </Typography>
              <Box sx={{
                width: 'fit-content',
                background: themeColors.bubbleSysBg,
                border: `1px solid ${themeColors.bubbleSysBorder}`,
                borderRadius: '18px 18px 18px 4px',
              }}>
                <ProcessingDots customcolors={themeColors}>
                  <span />
                  <span />
                  <span />
                </ProcessingDots>
              </Box>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </MessagesArea>

      {/* Input area */}
      <Box sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 1.5, sm: 2 },
        background: mode === 'dark'
          ? `linear-gradient(0deg, ${themeColors.bgDeep} 60%, transparent 100%)`
          : `linear-gradient(0deg, ${themeColors.bgDeep} 40%, transparent 100%)`,
        position: 'relative',
        zIndex: 10,
      }}>
        <InputWrapper elevation={0} customcolors={themeColors}>
          <IconButton size="small" sx={{
            color: themeColors.textDim,
            mr: 0.5,
            '&:hover': { color: themeColors.primary },
          }}>
            <AttachFile sx={{ fontSize: 20 }} />
          </IconButton>

          <StyledInput
            inputRef={inputRef}
            placeholder={CHAT_CONFIG.placeholders.input}
            variant="outlined"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            fullWidth
            autoComplete="off"
            customcolors={themeColors}
          />

          <IconButton size="small" sx={{
            color: themeColors.textDim,
            mx: 0.5,
            '&:hover': { color: themeColors.accent },
          }}>
            <Mic sx={{ fontSize: 20 }} />
          </IconButton>

          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim()}
            sx={{
              width: 36,
              height: 36,
              background: inputValue.trim()
                ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`
                : alpha(themeColors.textDim, 0.1),
              color: inputValue.trim() ? '#fff' : themeColors.textDim,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: inputValue.trim()
                  ? `linear-gradient(135deg, ${themeColors.secondary}, ${themeColors.primary})`
                  : alpha(themeColors.textDim, 0.15),
                transform: inputValue.trim() ? 'scale(1.05)' : 'none',
              },
              '&.Mui-disabled': {
                color: themeColors.textDim,
              },
            }}
          >
            <Send sx={{ fontSize: 18 }} />
          </IconButton>
        </InputWrapper>

        <Typography variant="caption" sx={{
          display: 'block',
          textAlign: 'center',
          mt: 1.5,
          color: alpha(themeColors.textDim, 0.45),
          fontSize: '0.7rem',
        }}>
          {CHAT_CONFIG.placeholders.footer}
        </Typography>

        {/* Agent mention popup */}
        <Fade in={Boolean(mentionAnchor)}>
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              bottom: '100%',
              left: 16,
              mb: 1,
              width: { xs: 260, sm: 300 },
              maxHeight: 240,
              overflowY: 'auto',
              background: mode === 'dark' ? alpha(THEME_DARK.bgDeep, 0.97) : alpha(THEME_LIGHT.bgDeep, 0.97),
              backdropFilter: 'blur(16px)',
              border: `1px solid ${themeColors.borderSubtle}`,
              borderRadius: '12px',
              zIndex: 20,
            }}
          >
            {filteredAgents.length > 0 ? filteredAgents.map((agent) => {
              const Icon = agent.icon || AutoAwesome;
              return (
                <MenuItem
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  sx={{
                    py: 1,
                    '&:hover': { background: alpha(themeColors.primary, 0.08) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Icon sx={{ width: 22, height: 22, fontSize: 18, color: agent.color || themeColors.primary }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={agent.title}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      color: themeColors.textBright,
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 500,
                    }}
                  />
                </MenuItem>
              );
            }) : (
              <MenuItem disabled>
                <ListItemText primary="No agents found" primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </MenuItem>
            )}
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default ChatInterface;
