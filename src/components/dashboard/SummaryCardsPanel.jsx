'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Collapse,
  Stack,
  alpha,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  GridView as GridViewIcon,
  ViewCarousel as CarouselIcon,
} from '@mui/icons-material';
import SummaryCard from './SummaryCard';
import {
  generateSummaryCards,
  approveSummaryCards,
  getSummaryCards,
  deleteSummaryCard,
  editApprovedCard,
  editPendingCard,
  sortCardsByPriority,
} from '../../services/summaryCardsService';

const SummaryCardsPanel = ({
  dashboardId,
  username,
  connectionId,
  widgets = [],
  summaryCards = [],
  onCardClick,
  onRefresh,
  onCreateWidget,
  onEditCard,
  compact = false,
}) => {
  const [cards, setCards] = useState([]);
  const [pendingCards, setPendingCards] = useState([]);
  const [approvalId, setApprovalId] = useState(null);
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [showPending, setShowPending] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Use summary cards from parent (widgets API) or fetch separately
  useEffect(() => {
    if (summaryCards && summaryCards.length > 0) {
      setCards(sortCardsByPriority(summaryCards));
      setLoading(false);
    } else if (dashboardId && username) {
      // Fallback: fetch separately if not provided
      const fetchApprovedCards = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await getSummaryCards({ username, dashboardId });
          if (response?.data?.summary_cards) {
            setCards(sortCardsByPriority(response.data.summary_cards));
          }
        } catch (err) {
          console.error('Error fetching summary cards:', err);
          setError('Failed to load insights');
        } finally {
          setLoading(false);
        }
      };
      fetchApprovedCards();
    }
  }, [summaryCards, dashboardId, username]);

  const handleGenerate = async () => {
    if (!dashboardId || !username || !connectionId) {
      setError('Missing required parameters');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await generateSummaryCards({
        username,
        dashboardId,
        connectionId,
        userContext: { widgetCount: widgets.length },
      });

      // Handle nested data structure: response.data.data
      const responseData = response?.data?.data || response?.data;
      
      if (responseData?.summary_cards) {
        setPendingCards(sortCardsByPriority(responseData.summary_cards));
        setApprovalId(responseData.approval_id);
        setSelectedCardIds(new Set(responseData.summary_cards.map(c => c.id)));
        setShowPending(true);
      }
    } catch (err) {
      console.error('Error generating summary cards:', err);
      setError(err.message || 'Failed to generate insights. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectCard = (cardId, isSelected) => {
    setSelectedCardIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCardIds.size === pendingCards.length) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds(new Set(pendingCards.map(c => c.id)));
    }
  };

  const handleApprove = async () => {
    if (!approvalId || selectedCardIds.size === 0) return;

    setApproving(true);
    setError(null);

    try {
      const response = await approveSummaryCards({
        username,
        dashboardId,
        approvalId,
        approvedCardIds: Array.from(selectedCardIds),
        userModifications: {},
      });

      setShowPending(false);
      setPendingCards([]);
      setApprovalId(null);
      setSelectedCardIds(new Set());
      
      // Trigger parent refresh to reload widgets and summary cards
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Error approving summary cards:', err);
      setError(err.message || 'Failed to approve insights. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const handleCancelPending = () => {
    setShowPending(false);
    setPendingCards([]);
    setApprovalId(null);
    setSelectedCardIds(new Set());
  };

  const handleDelete = async (cardId) => {
    if (!username || !dashboardId) return;

    try {
      await deleteSummaryCard({ username, dashboardId, cardId });
      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch (err) {
      console.error('Error deleting summary card:', err);
      setError('Failed to delete card');
    }
  };

  const handleEditApproved = async (cardId, updates) => {
    if (!username || !dashboardId) return;

    try {
      const response = await editApprovedCard({ username, dashboardId, cardId, updates });
      
      // Update the card in the local state
      setCards(prev => prev.map(c => 
        c.id === cardId ? { ...c, ...updates } : c
      ));
      
      return response;
    } catch (err) {
      console.error('Error editing approved card:', err);
      setError('Failed to edit card');
      throw err;
    }
  };

  const handleEditPending = async (cardId, updates) => {
    if (!dashboardId || !approvalId) return;

    try {
      const response = await editPendingCard({ dashboardId, approvalId, cardId, updates });
      
      // Update the card in the pending cards state
      setPendingCards(prev => prev.map(c => 
        c.id === cardId ? { ...c, ...updates } : c
      ));
      
      return response;
    } catch (err) {
      console.error('Error editing pending card:', err);
      setError('Failed to edit pending card');
      throw err;
    }
  };

  const renderSkeletons = () => (
    <Stack spacing={1.5}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={100}
          sx={{ borderRadius: 2.5 }}
        />
      ))}
    </Stack>
  );

  const renderEmptyState = () => (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <LightbulbIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
      </Box>
      <Typography
        sx={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#1F2937',
          mb: 0.5,
        }}
      >
        No Insights Yet
      </Typography>
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: '#6B7280',
          mb: 2,
          maxWidth: 200,
          mx: 'auto',
        }}
      >
        Generate AI-powered insights from your dashboard widgets
      </Typography>
      <Button
        variant="contained"
        size="small"
        startIcon={generating ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon />}
        onClick={handleGenerate}
        disabled={generating || widgets.length === 0}
        sx={{
          bgcolor: '#3B82F6',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: 2,
          px: 2.5,
          '&:hover': { bgcolor: '#2563EB' },
        }}
      >
        {generating ? 'Analyzing...' : 'Generate Insights'}
      </Button>
    </Box>
  );

  const renderPendingApproval = () => (
    <Fade in={showPending}>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            pb: 1.5,
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1F2937' }}>
              Review Insights
            </Typography>
            <Chip
              label={`${selectedCardIds.size}/${pendingCards.length}`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#EFF6FF',
                color: '#3B82F6',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Select All" arrow>
              <IconButton size="small" onClick={handleSelectAll}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 18,
                    color: selectedCardIds.size === pendingCards.length ? '#3B82F6' : '#9CA3AF',
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel" arrow>
              <IconButton size="small" onClick={handleCancelPending}>
                <CloseIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {pendingCards.map((card, index) => (
            <Fade in key={card.id} timeout={300 + index * 100}>
              <Box>
                <SummaryCard
                  card={card}
                  size="small"
                  selectable
                  selected={selectedCardIds.has(card.id)}
                  onSelect={handleSelectCard}
                  onEdit={(updates) => handleEditPending(card.id, updates)}
                  onDelete={() => handleDelete(card.id)}
                  showActions
                />
              </Box>
            </Fade>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleCancelPending}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: 2,
              borderColor: '#E5E7EB',
              color: '#6B7280',
              '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleApprove}
            disabled={approving || selectedCardIds.size === 0}
            startIcon={approving ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              flex: 1,
              bgcolor: '#10B981',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: 2,
              '&:hover': { bgcolor: '#059669' },
              '&:disabled': { bgcolor: '#D1D5DB' },
            }}
          >
            {approving ? 'Saving...' : `Approve (${selectedCardIds.size})`}
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  const renderApprovedCards = () => {
    // Sort cards: comparison/chart cards first, then table_summary, then others
    const sortedCards = [...cards].sort((a, b) => {
      const order = { comparison: 0, table_summary: 1, metric: 2, alert: 3, info: 4 };
      return (order[a.card_type] ?? 5) - (order[b.card_type] ?? 5);
    });

    return (
      <Box>
        {/* Compact view for chat drawer */}
        {compact ? (
          <Stack spacing={1.5}>
            {sortedCards.map((card, index) => (
              <Fade in key={card.id} timeout={300 + index * 100}>
                <Box>
                  <SummaryCard
                    card={card}
                    size="small"
                    onClick={onCardClick}
                    onCreateWidget={onCreateWidget}
                    onEdit={onEditCard ? () => onEditCard(card) : (updates) => handleEditApproved(card.id, updates)}
                    onDelete={() => handleDelete(card.id)}
                    showActions
                  />
                </Box>
              </Fade>
            ))}
          </Stack>
        ) : (
          /* Even grid layout - 3 columns on desktop, 2 on tablet, 1 on mobile */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {sortedCards.map((card, index) => (
              <Fade in key={card.id} timeout={300 + index * 100}>
                <Box
                  sx={{
                    height: '100%',
                  }}
                >
                  <SummaryCard
                    card={card}
                    size="medium"
                    onClick={onCardClick}
                    onCreateWidget={onCreateWidget}
                    onEdit={onEditCard ? () => onEditCard(card) : (updates) => handleEditApproved(card.id, updates)}
                    onDelete={() => handleDelete(card.id)}
                    showActions
                  />
                </Box>
              </Fade>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  if (compact) {
    return (
      <Box sx={{ px: 2, py: 1.5 }}>
        {loading ? (
          renderSkeletons()
        ) : showPending ? (
          renderPendingApproval()
        ) : cards.length > 0 ? (
          renderApprovedCards()
        ) : (
          renderEmptyState()
        )}
        {error && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#EF4444',
              textAlign: 'center',
              mt: 2,
            }}
          >
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          borderBottom: expanded ? '1px solid #E2E8F0' : 'none',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          '&:hover': { background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#FFFFFF' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, fontWeight: 600, color: '#1E293B' }}>
              Widgets
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, color: '#64748B' }}>
              {cards.length > 0 ? `${cards.length} available` : 'Generate widgets from your data'}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: expanded ? '#E2E8F0' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 20, color: '#475569' }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 20, color: '#64748B' }} />
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#FAFBFC' }}>
          {loading ? (
            renderSkeletons()
          ) : showPending ? (
            renderPendingApproval()
          ) : cards.length > 0 ? (
            renderApprovedCards()
          ) : (
            renderEmptyState()
          )}
          {error && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#EF4444',
                textAlign: 'center',
                mt: 2,
              }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SummaryCardsPanel;
