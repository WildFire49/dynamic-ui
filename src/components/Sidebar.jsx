'use client';

import React, { useState, useEffect } from 'react';
import { toZonedTime, format } from 'date-fns-tz';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  useTheme,
  IconButton,
  CircularProgress,
  Button,
  Paper,
  Chip,
  Fade,
  Skeleton
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GavelIcon from '@mui/icons-material/Gavel';
import {
  Dashboard as DashboardIcon,
  CreditCard as CreditIcon,
  Chat as ChatIcon,
  People as CustomersIcon,
  Assessment as IncentiveIcon,
  Close as CloseIcon,
  Build as ConfiguratorIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Security as AccessControlIcon,
} from '@mui/icons-material';
import NewStreetLogo from '../../public/assets/NewStreetLogo';

const drawerWidth = 240; // Reduced width

const menuItems = [
  { id: 'chat', label: 'Chat', icon: ChatIcon },
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'configurator', label: 'Configurator', icon: ConfiguratorIcon },
  { id: 'chatHistory', label: 'Chat History', icon: HistoryIcon },
  { id: 'creditRulesUpdate', label: 'Credit Rules Update', icon: GavelIcon },
  { id: 'creditCheck', label: 'Credit Check', icon: CreditIcon },
  { id: 'accessControl', label: 'Access Control', icon: AccessControlIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const Sidebar = ({ selectedTab, onTabChange, onLoadConversation }) => {
  const theme = useTheme();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [conversationContainer, setConversationContainer] = useState(null);

  // Helper function to convert UTC to IST
  const formatToIST = (dateString) => {
    try {
      // Ensure the date is parsed as UTC
      const utcDate = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
      const istDate = toZonedTime(utcDate, 'Asia/Kolkata');
      return format(istDate, 'MMM d, hh:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Fetch conversation history with pagination
  const fetchConversations = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const response = await fetch(`https://supervisory-dev.mifix.io/users/vaishakh_configurator3/conversations?page=${pageNum}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        const newConversations = data.conversations || [];
        
        if (append) {
          setConversations(prev => [...prev, ...newConversations]);
        } else {
          setConversations(newConversations);
        }
        
        setHasMore(newConversations.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loadingMore) {
      fetchConversations(page + 1, true);
    }
  };

  // Fetch conversation details and load chat
  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`https://supervisory-dev.mifix.io/conversations/${conversationId}/history`);
      if (response.ok) {
        const data = await response.json();
        // Call the callback to load the conversation in the main app
        if (onLoadConversation) {
          onLoadConversation(data.history);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  useEffect(() => {
    fetchConversations(1, false);
  }, []);

  const handleMenuClick = (item) => {
    // Handle navigation for specific items
    if (item.id === 'dashboard') {
      router.push('/dashboard');
    } else if (item.id === 'configurator') {
      router.push('/configurator');
    } else {
      // For other items, use the callback
      onTabChange(item.id);
    }
  };


  const drawerContent = (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', pb: 4, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
        <Box sx={{ 
          animation: 'fadeInScale 0.5s ease-out',
          '@keyframes fadeInScale': {
            '0%': { 
              opacity: 0, 
              transform: 'scale(0.8)' 
            },
            '100%': { 
              opacity: 1, 
              transform: 'scale(1)' 
            }
          }
        }}>
          <Box
            sx={{
              width: 86,
              height: 86,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Image 
              src="/mifix-logo.png"
              alt="MiFiX Logo"
              width={66}
              height={66}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              textAlign: 'center',
              marginBottom: 1
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <svg width="120" height="40" viewBox="0 0 120 40">
                <text x="60" y="25" fontSize="24" fontWeight="bold" textAnchor="middle">MiFiX.ai</text>
              </svg>
            </div>
          </Typography>
        </Box>
      </Box>  

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedTab === item.id;
              console.log(selectedTab);
              
              return (
                <ListItem 
                  key={item.id} 
                  disablePadding 
                  sx={{ 
                    px: 2, 
                    mb: 0.5,
                    animation: `slideInLeft 0.3s ease-out ${index * 0.1}s both`,
                    '@keyframes slideInLeft': {
                      '0%': { 
                        opacity: 0, 
                        transform: 'translateX(-20px)' 
                      },
                      '100%': { 
                        opacity: 1, 
                        transform: 'translateX(0)' 
                      }
                    }
                  }}
                >
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleMenuClick(item)}
                      sx={{
                        borderRadius: 2,
                        minHeight: 48,
                        backgroundColor: isSelected ? '#b5c8de' : 'transparent',
                        '&:hover': {
                          backgroundColor: isSelected 
                            ? '#b5c8de' 
                            : 'rgba(181, 200, 222, 0.1)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#b5c8de',
                          '&:hover': {
                            backgroundColor: '#b5c8de',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isSelected ? '#00468e' : '#666666',
                          minWidth: 40,
                        }}
                      >
                        <Icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.9rem',
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? '#00468e' : '#1a1a1a',
                          },
                        }}
                      />
                    </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </Box>

      <Divider />

      {/* Recent Conversations Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e1e5e9' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#2c3e50',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ChatIcon sx={{ fontSize: 20, color: '#3498db' }} />
            Chat History
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#7f8c8d',
              fontSize: '0.75rem'
            }}
          >
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '3px',
              '&:hover': {
                background: '#a8a8a8',
              },
            },
          }}
          onScroll={handleScroll}
        >
          {loading && conversations.length === 0 ? (
            <Box sx={{ p: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2, mb: 1 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
              {conversations.map((conversation, index) => (
                <Fade in={true} timeout={300 + index * 100} key={conversation.id}>
                  <Paper
                    elevation={0}
                    onClick={() => loadConversation(conversation.id)}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid #e8ecf0',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        borderColor: '#3498db',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(52, 152, 219, 0.15)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3498db, #2980b9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
                        }}>
                          {index + 1}
                        </Box>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: '#2c3e50',
                              lineHeight: 1.2
                            }}
                          >
                            Conversation {index + 1}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.75rem',
                              color: '#7f8c8d',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 0.5
                            }}
                          >
                            {formatToIST(conversation.updated_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label="Recent" 
                        size="small" 
                        sx={{ 
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 500,
                          backgroundColor: '#e8f5e8',
                          color: '#27ae60',
                          border: 'none',
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }} 
                      />
                    </Box>
                  </Paper>
                </Fade>
              ))}
              
              {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#3498db' }} />
                </Box>
              )}
              
              {conversations.length === 0 && !loading && (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  px: 2
                }}>
                  <ChatIcon sx={{ fontSize: 48, color: '#bdc3c7', mb: 2 }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#7f8c8d',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      mb: 1
                    }}
                  >
                    No conversations yet
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#95a5a6',
                      fontSize: '0.75rem'
                    }}
                  >
                    Start a new chat to see your history here
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      {/* Footer */}
      {/* <Box sx={{ p: 2, textAlign: 'center' }}>
       <NewStreetLogo />
      </Box> */}
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: 320,
        zIndex: 1200,
        overflow: 'hidden'
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            backgroundColor: '#fafbfc',
            borderRight: '1px solid #e1e5e9',
            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
