'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  autoRefresh = true,
  selectionMode = false,
  selectedCards = new Set(),
  onToggleCardSelection = () => {},
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
  const isFetchingRef = useRef(false);
  const latestCardsRef = useRef(summaryCards || []);

  useEffect(() => {
    if (summaryCards && summaryCards.length > 0) {
      latestCardsRef.current = summaryCards;
    }
  }, [summaryCards]);

  const fetchLatestCards = useCallback(
    async ({ withLoader = false, force = false } = {}) => {
      if (!dashboardId || !username || !connectionId) return;
      if (isFetchingRef.current && !force) return;

      if (withLoader) {
        setLoading(true);
      }
      setError(null);
      isFetchingRef.current = true;

      try {
        const response = await getSummaryCards({
          username,
          dashboardId,
          connectionId,
          existingCards:
            (latestCardsRef.current && latestCardsRef.current.length > 0
              ? latestCardsRef.current
              : undefined),
        });
        if (response?.data?.summary_cards) {
          const sortedCards = sortCardsByPriority(response.data.summary_cards);
          latestCardsRef.current = sortedCards;
          setCards(sortedCards);
        }
      } catch (err) {
        setError('Failed to load insights');
      } finally {
        if (withLoader) {
          setLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [dashboardId, username, connectionId]
  );

  // Use summary cards from parent (widgets API) or fetch separately
  useEffect(() => {
    if (summaryCards && summaryCards.length > 0) {
      latestCardsRef.current = summaryCards;
      setCards(sortCardsByPriority(summaryCards));
    }
  }, [summaryCards]);

  useEffect(() => {
    if (!autoRefresh) return;
    if (dashboardId && username && connectionId) {
      const shouldShowLoader = !summaryCards || summaryCards.length === 0;
      fetchLatestCards({ withLoader: shouldShowLoader });
    }
  }, [autoRefresh, dashboardId, username, connectionId, summaryCards?.length, fetchLatestCards]);

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
      if (autoRefresh) {
        await fetchLatestCards({ withLoader: false, force: true });
      }
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
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

      // Re-fetch to get fresh widget data for this card
      if (autoRefresh) {
        await fetchLatestCards({ withLoader: false, force: true });
      }
      
      return response;
    } catch (err) {
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
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          mb={2}
          pb={1.5}
          borderBottom="1px solid #E5E7EB"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
              {cards.length} insights
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
          </Stack>
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
        </Stack>

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

  const handleCardClick = useCallback(
    (card) => {
      
      if (selectionMode) {
        return;
      }
      
      onCardClick?.(card);
    },
    [onCardClick, selectionMode]
  );

  const renderApprovedCards = () => {
    // Already sorted by priority in fetchLatestCards
    const sortedCards = cards;
    const cardCount = sortedCards.length;
    const desktopColumns =
      cardCount === 1
        ? '1fr'
        : cardCount === 2
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(3, minmax(0, 1fr))';

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
                    onClick={handleCardClick}
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
                sm: cardCount === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                md: desktopColumns,
                lg: desktopColumns,
                xl: cardCount >= 4 ? 'repeat(4, minmax(0, 1fr))' : desktopColumns,
              },
              gap: { xs: 2, sm: 3 },
              pb: 2,
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
                    onClick={handleCardClick}
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
    <Box sx={{ width: '100%' }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', letterSpacing: '-0.01em' }}>
              Insights & Widgets
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
              {cards.length > 0 ? `${cards.length} items available` : 'AI-generated insights'}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          size="small" 
          sx={{ 
            bgcolor: expanded ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            color: expanded ? '#3B82F6' : '#64748B',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)' }
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box>
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
                fontSize: '0.85rem',
                color: '#EF4444',
                textAlign: 'center',
                mt: 2,
                bgcolor: '#FEF2F2',
                py: 1,
                borderRadius: 2,
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
