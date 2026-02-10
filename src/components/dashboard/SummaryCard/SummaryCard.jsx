'use client';

import React, { useMemo, memo } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip, Checkbox, alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  InfoOutlined as InfoOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { CARD_THEMES, ICON_MAP, URGENCY_CONFIG } from './constants';
import {
  formatIndianCurrency, smartFormat, toNumeric, prettifyLabel,
  getSafeDisplayValue, isCardDataEmpty,
} from './utils';
import CardBackground from './CardBackground';
import DataSyncLoader from './DataSyncLoader';
import CXOSingleMetric from './CXOSingleMetric';
import CXOMultiMetric from './CXOMultiMetric';
import ComparisonChart from './ComparisonChart';
import ProgressRing from './ProgressRing';
import TrendSparkline from './TrendSparkline';
import DistributionDonut from './DistributionDonut';
import StatusGrid from './StatusGrid';
import ChangeIndicator from './ChangeIndicator';
import MiniTable from './MiniTable';
import AlertCardContent from './AlertCardContent';

const SummaryCard = memo(({
  card,
  cardIndex = 0,
  variant = 'default',
  size = 'medium',
  selectable = false,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onClick,
  onCreateWidget,
  showActions = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelection = () => {},
}) => {
  const {
    id, card_type = 'metric', urgency = 'info', title, description,
    primary_value, primary_label, secondary_value, secondary_label,
    trend, trend_value, icon = 'Info', color,
    action_text, comparison_data, metric_unit,
    formatted_primary_value, formatted_secondary_value,
    top_entries, bottom_entries, info_data, query_results,
    _pipelineData, _dataGrid, sort_by, sort_order,
    target_value, formatted_target_value, progress_percent,
    sparkline_data, segments, statuses,
    current_value, formatted_current, current_label,
    previous_value, formatted_previous, previous_label,
    change_percent, change_direction,
    columns, rows, mini_columns, mini_rows,
  } = card;

  const theme = CARD_THEMES[cardIndex % CARD_THEMES.length];

  // Recalculate primary_value for comparison cards
  let correctedPrimaryValue = primary_value;
  let correctedFormattedPrimaryValue = formatted_primary_value;
  if (card_type === 'comparison' && Array.isArray(query_results) && query_results.length > 0) {
    const totalMtd = query_results.reduce((sum, result) => {
      const mtdAmount = result.mtd_disbursed_amount || 0;
      const mtdLakhs = mtdAmount > 10000 ? mtdAmount / 100000 : mtdAmount;
      return sum + mtdLakhs;
    }, 0);
    if (totalMtd > 0) {
      correctedPrimaryValue = totalMtd.toFixed(2);
      correctedFormattedPrimaryValue = `₹${totalMtd.toFixed(2)}L`;
    }
  }

  // Percentage detection
  const isPercentageCard = /percent|%|otr/i.test(title || '') || /percent|%|otr/i.test(primary_label || '');
  let finalFormattedPrimary = correctedFormattedPrimaryValue;
  if (isPercentageCard && correctedPrimaryValue != null) {
    const numVal = toNumeric(correctedPrimaryValue);
    if (numVal !== null) {
      finalFormattedPrimary = `${numVal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
    }
  }

  const displayPrimaryValue = getSafeDisplayValue(correctedPrimaryValue, finalFormattedPrimary, metric_unit);
  const displaySecondaryValue = getSafeDisplayValue(secondary_value, formatted_secondary_value, metric_unit);
  const displayTrendValue = trend_value;

  const rawInfoSource = useMemo(() => {
    if (Array.isArray(info_data) && info_data.length > 0) return info_data;
    if (Array.isArray(query_results) && query_results.length > 0) return query_results;
    if (Array.isArray(_pipelineData) && _pipelineData.length > 0) return _pipelineData;
    if (Array.isArray(_dataGrid?.gridRows) && _dataGrid.gridRows.length > 0) return _dataGrid.gridRows;
    return [];
  }, [info_data, query_results, _pipelineData, _dataGrid]);

  const resolvedInfoData = useMemo(() => {
    if (!Array.isArray(rawInfoSource) || rawInfoSource.length === 0) return [];
    if (rawInfoSource.every(e => e && typeof e === 'object' && ('name' in e || 'label' in e || 'title' in e))) {
      return rawInfoSource.map((e) => ({
        name: e.name || e.label || e.title || prettifyLabel(e.field || e.key || ''),
        value: e.value ?? e.count ?? e.total ?? e.formatted ?? null,
        formatted: e.formatted || (e.value !== undefined ? smartFormat(e.value) : e.value) || e.count || e.total || '—',
      }));
    }
    return rawInfoSource.flatMap((row) => {
      if (!row || typeof row !== 'object') return [];
      return Object.entries(row)
        .filter(([key]) => key !== 'id' && !key.startsWith('_'))
        .map(([key, value]) => {
          const isPercent = /percent|%|otr/i.test(key);
          let formatted;
          if (value === null || value === undefined) formatted = 'No data';
          else if (isPercent && typeof value === 'number') formatted = `${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
          else formatted = smartFormat(value);
          return { name: prettifyLabel(key), value, formatted };
        });
    });
  }, [rawInfoSource]);

  const hasInfoData = resolvedInfoData.length > 0;
  const IconComponent = ICON_MAP[icon] || InfoIcon;
  const urgencyConfig = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.info;
  const isCXOView = (card_type === 'info' || card_type === 'metric') && hasInfoData;
  const hasContent = !isCardDataEmpty(card, hasInfoData);

  const handleClick = (e) => {
    e.stopPropagation();
    if (selectable && onSelect) onSelect(id, !selected);
    else if (onClick) onClick(card);
  };

  // ─── Render Content ─────────────────────────────────

  const renderContent = () => {
    if (card_type === 'progress_tracker') return <ProgressRing card={card} theme={theme} />;
    if (card_type === 'trend_sparkline') return <TrendSparkline card={card} theme={theme} />;
    if (card_type === 'distribution_donut') return <DistributionDonut card={card} theme={theme} />;
    if (card_type === 'status_grid') return <StatusGrid card={card} theme={theme} />;
    if (card_type === 'change_indicator') return <ChangeIndicator card={card} theme={theme} />;
    if (card_type === 'mini_table') return <MiniTable card={card} theme={theme} />;

    if (isCXOView) {
      return resolvedInfoData.length === 1
        ? <CXOSingleMetric data={resolvedInfoData[0]} theme={theme} title={title} icon={IconComponent} />
        : <CXOMultiMetric data={resolvedInfoData} theme={theme} />;
    }

    // Table Summary - Top Entries
    if (card_type === 'table_summary' && top_entries && top_entries.length > 0) {
      return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: top_entries.length <= 3 ? 3 : 2, flex: 1, justifyContent: 'center', py: 0.5 }}>
          {top_entries.map((entry, idx) => {
            const maxValue = Math.max(...top_entries.map(e => e.value), 1);
            const percentage = (entry.value / maxValue) * 100;
            const rankTheme = CARD_THEMES[idx % CARD_THEMES.length];
            return (
              <Tooltip key={idx} title={`${entry.fullName || entry.name}: ${entry.formatted}`} arrow placement="top" enterDelay={300}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                      <Box sx={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: rankTheme.primary, color: '#fff', borderRadius: 2.5,
                        fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                      }}>
                        {entry.rank}
                      </Box>
                      <Typography sx={{
                        fontSize: '0.95rem', color: '#0F172A', fontWeight: 700,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                      }}>
                        {entry.name}
                      </Typography>
                    </Box>
                    <Typography sx={{
                      fontSize: '1.15rem', color: rankTheme.primary,
                      fontWeight: 900, letterSpacing: '-0.02em', flexShrink: 0,
                    }}>
                      {entry.formatted || smartFormat(entry.value)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 10, bgcolor: alpha(rankTheme.primary, 0.08), borderRadius: 5, overflow: 'hidden' }}>
                    <Box sx={{
                      width: `${percentage}%`, height: '100%',
                      background: `linear-gradient(90deg, ${rankTheme.primary}, ${rankTheme.secondary})`,
                      borderRadius: 5,
                    }} />
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      );
    }

    // Table Summary - Bottom Entries
    if (card_type === 'table_summary' && bottom_entries && bottom_entries.length > 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'center', py: 0.5 }}>
          {bottom_entries.slice(0, 5).map((entry, idx) => (
            <Box key={idx} sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              py: 1.5, px: 2, bgcolor: alpha(theme.primary, 0.04),
              borderRadius: 3, border: `1px solid ${alpha(theme.primary, 0.08)}`,
              '&:hover': { bgcolor: alpha(theme.primary, 0.07) },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%', bgcolor: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800, color: theme.primary,
                  border: `1px solid ${alpha(theme.primary, 0.15)}`,
                }}>
                  {entry.rank || idx + 1}
                </Box>
                <Typography sx={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 700 }}>
                  {entry.name}
                </Typography>
              </Box>
              <Chip
                label={entry.value === 0 ? 'No Activity' : entry.formatted}
                size="small"
                sx={{
                  height: 24, bgcolor: theme.primary, color: '#fff',
                  fontWeight: 800, fontSize: '0.72rem', borderRadius: 2,
                }}
              />
            </Box>
          ))}
        </Box>
      );
    }

    // Comparison - Array Format
    if (card_type === 'comparison' && Array.isArray(comparison_data) && comparison_data.length > 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: comparison_data.length <= 2 ? 3 : 2, flex: 1, justifyContent: 'center', py: 0.5 }}>
          {comparison_data.map((entry, idx) => {
            const maxValue = Math.max(...comparison_data.map(e => e.mtd_lakhs || e.value || 0), 1);
            const value = entry.mtd_lakhs || entry.value || 0;
            const percentage = (value / maxValue) * 100;
            const changePct = entry.change_pct || 0;
            const barTheme = CARD_THEMES[idx % CARD_THEMES.length];
            const isPositive = changePct >= 0;
            return (
              <Box key={idx} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-end', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                      fontSize: { xs: '0.85rem', sm: '0.95rem' }, color: '#0F172A',
                      fontWeight: 800, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {entry.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: barTheme.primary, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {entry.formatted?.split(' ')[0] || smartFormat(value)}
                      </Typography>
                      {entry.formatted?.includes('(') && (
                        <Box sx={{
                          display: 'flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.25, borderRadius: 1.5,
                          bgcolor: isPositive ? alpha('#10B981', 0.08) : alpha('#EF4444', 0.08),
                        }}>
                          {isPositive ? <TrendingUpIcon sx={{ fontSize: 12, color: '#059669' }} /> : <TrendingDownIcon sx={{ fontSize: 12, color: '#DC2626' }} />}
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: isPositive ? '#059669' : '#DC2626' }}>
                            {Math.abs(changePct)}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                    #{idx + 1}
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', height: 12, bgcolor: alpha(barTheme.primary, 0.06), borderRadius: 6, overflow: 'hidden' }}>
                  <Box sx={{
                    width: `${Math.min(percentage, 100)}%`, height: '100%',
                    background: `linear-gradient(90deg, ${barTheme.primary}, ${barTheme.secondary})`,
                    borderRadius: 6,
                  }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      );
    }

    // Info Card with data
    if (card_type === 'info' && hasInfoData) {
      return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, justifyContent: 'center' }}>
          {primary_value !== undefined && primary_value !== null && (
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {primary_label || 'Total'}
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: theme.primary, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {displayPrimaryValue}
              </Typography>
            </Box>
          )}
          {resolvedInfoData.slice(0, 5).map((entry, idx) => {
            const allValues = resolvedInfoData.map(e => (typeof e.value === 'number' ? e.value : toNumeric(e.value) || 0));
            const maxValue = Math.max(...allValues, 1);
            const numericValue = typeof entry.value === 'number' ? entry.value : toNumeric(entry.value) || 0;
            const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 0;
            const entryTheme = CARD_THEMES[idx % CARD_THEMES.length];
            return (
              <Box key={idx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entryTheme.primary }} />
                    <Typography sx={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                      {entry.name || entry.label || `Item ${idx + 1}`}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.88rem', color: entryTheme.primary, fontWeight: 700 }}>
                    {entry.formatted || (typeof entry.value === 'number' ? smartFormat(entry.value) : entry.value)}
                  </Typography>
                </Box>
                {typeof entry.value === 'number' && (
                  <Box sx={{ width: '100%', height: 7, bgcolor: alpha(entryTheme.primary, 0.1), borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: entryTheme.primary, borderRadius: 4 }} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }

    // Alert Card with data
    if (card_type === 'alert' && hasInfoData) {
      return <AlertCardContent data={resolvedInfoData} theme={theme} />;
    }

    // Comparison - Object Format
    if (comparison_data && comparison_data.entity1 && comparison_data.entity2) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, justifyContent: 'space-evenly' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: theme.primary, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {comparison_data.entity1?.formatted || smartFormat(comparison_data.entity1?.value)}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, mt: 0.5, textTransform: 'uppercase' }}>
                {comparison_data.entity1?.name || primary_label}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: theme.secondary, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {comparison_data.entity2?.formatted || smartFormat(comparison_data.entity2?.value)}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, mt: 0.5, textTransform: 'uppercase' }}>
                {comparison_data.entity2?.name || secondary_label}
              </Typography>
            </Box>
          </Box>
          <ComparisonChart data={comparison_data} theme={theme} />
          {comparison_data.difference_percent && (
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
              py: 0.75, px: 1, bgcolor: theme.accent, borderRadius: 2, border: `1px dashed ${alpha(theme.primary, 0.2)}`,
            }}>
              <TrendingUpIcon sx={{ fontSize: 14, color: theme.primary }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: theme.primary }}>
                {comparison_data.winner} leads by {comparison_data.difference_percent > 100 ? `${(comparison_data.difference_percent / 100).toFixed(0)}x` : `${comparison_data.difference_percent.toFixed(0)}%`}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // Standard Metric (fallback)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', flex: 1, py: 2 }}>
        {primary_value && (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: '100%', bgcolor: alpha(theme.primary, 0.04), borderRadius: 4,
            py: 3, px: 3, border: `1px dashed ${alpha(theme.primary, 0.15)}`,
          }}>
            <Typography sx={{
              fontSize: { xs: '2.5rem', sm: '3rem' }, fontWeight: 800,
              color: urgency === 'critical' ? '#EF4444' : urgency === 'high' ? '#F59E0B' : '#0F172A',
              lineHeight: 1, letterSpacing: '-0.04em', mb: 1.5, textAlign: 'center',
            }}>
              {displayPrimaryValue}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {primary_label && (
                <Chip label={primary_label} sx={{
                  fontSize: '0.8rem', fontWeight: 700, color: theme.primary,
                  bgcolor: theme.accent, borderRadius: 2, height: 30,
                  border: `1px solid ${alpha(theme.primary, 0.15)}`,
                }} />
              )}
              {trend && (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.25,
                  bgcolor: trend === 'up' ? '#ECFDF5' : trend === 'down' ? '#FEF2F2' : '#F1F5F9',
                  px: 1, py: 0.5, borderRadius: 2, height: 30,
                  border: `1px solid ${trend === 'up' ? '#A7F3D0' : trend === 'down' ? '#FECACA' : '#E2E8F0'}`,
                }}>
                  {trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 14, color: '#059669' }} /> : trend === 'down' ? <TrendingDownIcon sx={{ fontSize: 14, color: '#DC2626' }} /> : null}
                  {displayTrendValue && (
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: trend === 'up' ? '#059669' : trend === 'down' ? '#DC2626' : '#475569' }}>
                      {displayTrendValue}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
        {secondary_value && !comparison_data && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#64748B', lineHeight: 1, mb: 0.25 }}>
              {displaySecondaryValue}
            </Typography>
            {secondary_label && <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500 }}>{secondary_label}</Typography>}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 5, bgcolor: '#FFFFFF',
        background: isCXOView
          ? 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFB 100%)'
          : 'linear-gradient(145deg, #FFFFFF 0%, #FAFBFC 100%)',
        border: '1px solid',
        borderColor: selected ? theme.primary : 'rgba(226, 232, 240, 0.8)',
        cursor: selectable || onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: selected
          ? `0 8px 24px -6px ${alpha(theme.primary, 0.2)}`
          : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        height: '100%', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', minHeight: { xs: 140, sm: 160, md: 180 },
        '&:hover': {
          boxShadow: `0 8px 28px -4px ${alpha(theme.primary, 0.12)}, 0 4px 12px rgba(0,0,0,0.04)`,
          borderColor: alpha(theme.primary, 0.3),
          '& .card-actions': { opacity: 1 },
        },
      }}
    >
      <CardBackground theme={theme} cardType={card_type} urgency={urgency} />

      {/* Selection checkbox */}
      {selectionMode && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
          <Checkbox
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onToggleSelection(id); }}
            sx={{ color: alpha(theme.primary, 0.5), '&.Mui-checked': { color: theme.primary } }}
          />
        </Box>
      )}

      {selectable && !selectionMode && (
        <Box sx={{
          position: 'absolute', top: 14, right: 14, width: 22, height: 22,
          borderRadius: '50%', border: `2px solid ${selected ? theme.primary : '#CBD5E1'}`,
          bgcolor: selected ? theme.primary : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}>
          {selected && <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />}
        </Box>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          {!isCXOView && (
            <Box sx={{
              width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 },
              borderRadius: 3,
              background: (card_type === 'alert' && (urgency === 'critical' || urgency === 'high'))
                ? `linear-gradient(135deg, ${urgencyConfig.color} 0%, ${urgencyConfig.color}CC 100%)`
                : theme.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IconComponent sx={{ fontSize: { xs: 24, sm: 26 }, color: '#FFFFFF' }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{
                fontSize: { xs: '1.15rem', sm: '1.3rem' }, fontWeight: 800,
                color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1,
              }}>
                {title}
              </Typography>
              {description && (
                <Tooltip title={description} arrow placement="top">
                  <IconButton size="small" sx={{
                    width: 22, height: 22, color: alpha(theme.primary, 0.6),
                    '&:hover': { bgcolor: alpha(theme.primary, 0.08), color: theme.primary },
                  }}>
                    <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {urgency === 'critical' && (
              <Chip label={urgencyConfig.label} size="small" sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA',
              }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      {hasContent && (
        <Box sx={{
          display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5,
          position: 'relative', zIndex: 1, flex: 1,
          justifyContent: (card_type === 'metric' || card_type === 'alert' || card_type === 'info') ? 'center' : 'flex-start',
        }}>
          {renderContent()}
        </Box>
      )}

      {/* Data Sync Loader */}
      {title && !hasContent && <DataSyncLoader theme={theme} />}

      {/* Action buttons */}
      {showActions && (
        <Box
          className="card-actions"
          sx={{
            position: 'absolute', top: 10, right: 10,
            display: 'flex', gap: 0.5,
            opacity: 0, transition: 'opacity 0.15s ease', zIndex: 2,
          }}
        >
          {onCreateWidget && (
            <Tooltip title="Create Widget" arrow placement="top">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCreateWidget(card); }}
                sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#EFF6FF', color: '#3B82F6', borderColor: '#BFDBFE' } }}>
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit" arrow placement="top">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', color: '#334155', borderColor: '#CBD5E1' } }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Remove" arrow placement="top">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#FEF2F2', color: '#EF4444', borderColor: '#FECACA' } }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.card === nextProps.card &&
    prevProps.cardIndex === nextProps.cardIndex &&
    prevProps.selected === nextProps.selected &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.selectionMode === nextProps.selectionMode
  );
});

export default SummaryCard;
