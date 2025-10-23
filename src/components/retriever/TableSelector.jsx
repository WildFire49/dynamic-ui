import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  TableChart as TableIcon,
  CheckCircle,
  ExpandMore as ExpandMoreIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  ViewColumn as ColumnIcon,
  Link as RelationIcon,
  Speed as SpeedIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import fastKgService from '@/services/fastKgService';
import useRetrieverStore from '@/store/retrieverStore';
import { COLORS, COMPONENT_STYLES, SPACING, BORDER_RADIUS } from '@/styles/retrieverStyles';

const TableSelector = ({ connectionData, onTablesSelected }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectMode, setSelectMode] = useState('include'); // 'include' or 'exclude'
  const [usingCache, setUsingCache] = useState(false);

  // Zustand store
  const { getCachedTableList, setCachedTableList, clearTableListCache } = useRetrieverStore();
  
  // Ref to track if tables have been fetched for current connection
  const fetchedConnectionRef = React.useRef(null);

  useEffect(() => {
    if (connectionData && connectionData.id) {
      // Only fetch if connection ID has changed
      if (fetchedConnectionRef.current !== connectionData.id) {
        fetchedConnectionRef.current = connectionData.id;
        fetchAvailableTables(false);
      }
    }
  }, [connectionData?.id]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = availableTables.filter((table) =>
        table.table_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTables(filtered);
    } else {
      setFilteredTables(availableTables);
    }
  }, [searchQuery, availableTables]);

  const fetchAvailableTables = async (forceRefresh = false) => {
    setError(null);

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedTableList(connectionData);
      if (cached) {
        console.log('📦 Using cached table list', cached);
        setAvailableTables(cached.tables);
        setFilteredTables(cached.tables);
        setUsingCache(true);
        return;
      }
    }

    // Fetch from API
    setLoading(true);
    setUsingCache(false);

    try {
      console.log('🌐 Fetching table list from fast-kg API...');
      console.log('Connection ID:', connectionData.id);
      console.log('Schema:', connectionData.schema);
      
      const response = await fastKgService.listTables(connectionData.id, connectionData.schema);
      
      if (response.data.success) {
        const tables = response.data.tables || [];
        console.log(`✅ Fetched ${tables.length} tables`);
        
        // Transform to match expected format
        const transformedTables = tables.map(table => ({
          table_name: table.name,
          schema_name: table.schema_name,
          row_count: table.row_count,
          column_count: table.column_count,
        }));
        
        setAvailableTables(transformedTables);
        setFilteredTables(transformedTables);
        
        // Cache the result
        setCachedTableList(connectionData, transformedTables);
        console.log('✅ Table list cached successfully');
      }
    } catch (err) {
      console.error('❌ Error fetching tables:', err);
      setError(err.message || 'Failed to fetch available tables');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTables = () => {
    console.log('🔄 Refreshing table list...');
    clearTableListCache(connectionData);
    fetchAvailableTables(true);
  };

  const handleTableToggle = (tableName) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName]
    );
  };

  const handleSelectAll = () => {
    setSelectedTables(filteredTables.map((t) => t.table_name));
  };

  const handleClearAll = () => {
    setSelectedTables([]);
  };

  const handleConfirmSelection = () => {
    console.log('✅ Table selection confirmed');
    console.log('📋 Selected tables count:', selectedTables.length);
    console.log('📋 Selected tables:', selectedTables);
    
    if (onTablesSelected) {
      onTablesSelected({
        selectedTables,
        selectMode,
        totalAvailable: availableTables.length,
      });
    }
  };

  const getTablesByRowCount = () => {
    const sorted = [...filteredTables].sort((a, b) => b.row_count - a.row_count);
    return {
      large: sorted.filter((t) => t.row_count > 100000),
      medium: sorted.filter((t) => t.row_count > 10000 && t.row_count <= 100000),
      small: sorted.filter((t) => t.row_count <= 10000),
    };
  };

  const tableGroups = getTablesByRowCount();

  const renderTableGroup = (title, tables, color) => {
    if (tables.length === 0) return null;

    return (
      <Accordion defaultExpanded={title === 'Large Tables'}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
              {title}
            </Typography>
            <Chip
              label={`${tables.length} tables`}
              size="small"
              sx={{ backgroundColor: color, color: 'white', mr: 2 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {tables.map((table) => (
              <Grid item xs={12} sm={6} md={4} key={table.table_name}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTables.includes(table.table_name)}
                      onChange={() => handleTableToggle(table.table_name)}
                      size="small"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {table.table_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                        {table.row_count?.toLocaleString() || 0} rows, {table.column_count} cols
                      </Typography>
                    </Box>
                  }
                  sx={{
                    width: '100%',
                    m: 0,
                    p: 1,
                    borderRadius: '4px',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  if (!connectionData) {
    return (
      <Paper sx={COMPONENT_STYLES.connectionCard}>
        <Alert severity="info">Please connect to database first</Alert>
      </Paper>
    );
  }

  // Calculate stats
  const totalRows = availableTables.reduce((sum, t) => sum + (t.row_count > 0 ? t.row_count : 0), 0);
  const totalColumns = availableTables.reduce((sum, t) => sum + t.column_count, 0);
  const avgRowsPerTable = availableTables.length > 0 ? Math.floor(totalRows / availableTables.length) : 0;

  return (
    <Paper sx={{ ...COMPONENT_STYLES.connectionCard, p: 0 }}>
      {/* Header Section with Gradient */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3,
        color: 'white',
        borderRadius: `${BORDER_RADIUS.large} ${BORDER_RADIUS.large} 0 0`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: BORDER_RADIUS.medium, 
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}>
              <TableIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Table Selection
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Choose tables to optimize your knowledge graph build
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {usingCache && (
              <Chip
                label="Cached"
                size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, backdropFilter: 'blur(10px)' }}
                icon={<SpeedIcon sx={{ color: 'white !important' }} />}
              />
            )}
            <Button
              variant="contained"
              size="small"
              onClick={handleRefreshTables}
              disabled={loading}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.25)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.35)' },
                backdropFilter: 'blur(10px)',
              }}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <StorageIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                      {availableTables.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total Tables
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <ColumnIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                      {totalColumns}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total Columns
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <RelationIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                      {totalRows > 1000000 ? `${(totalRows / 1000000).toFixed(1)}M` : totalRows > 1000 ? `${(totalRows / 1000).toFixed(1)}K` : totalRows}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total Rows
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <CheckCircle sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                      {selectedTables.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Selected
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Content Section */}
      <Box sx={{ 
        p: 3, 
        maxHeight: 'calc(100vh - 350px)', 
        overflow: 'auto',
        overflowX: 'hidden'
      }}>

        {availableTables.length > 50 && (
          <Alert 
            severity="info" 
            icon={<InfoIcon />} 
            sx={{ 
              mb: 3,
              borderRadius: BORDER_RADIUS.medium,
              border: `1px solid ${COLORS.primary}30`,
              backgroundColor: `${COLORS.primary}08`,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 0.5 }}>
                💡 Performance Tip
              </Typography>
              <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                Large database detected ({availableTables.length} tables). Select only needed tables to reduce build time from 5-10 minutes to 30-60 seconds.
              </Typography>
            </Box>
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search tables by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: COLORS.primary,
                  }
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.textMuted }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<SelectAllIcon />}
            onClick={handleSelectAll}
            sx={{ 
              backgroundColor: COLORS.primary,
              '&:hover': { backgroundColor: COLORS.secondary },
            }}
          >
            Select All ({filteredTables.length})
          </Button>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            sx={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
          >
            Clear
          </Button>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ 
            px: 2, 
            py: 1, 
            borderRadius: BORDER_RADIUS.medium, 
            backgroundColor: selectedTables.length > 0 ? `${COLORS.success}15` : `${COLORS.textMuted}10`,
            border: `1px solid ${selectedTables.length > 0 ? COLORS.success : COLORS.border}`,
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: selectedTables.length > 0 ? COLORS.success : COLORS.textMuted }}>
              {selectedTables.length} / {filteredTables.length} Selected
            </Typography>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ py: 4 }}>
            <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />
            <Typography variant="body2" sx={{ textAlign: 'center', color: COLORS.textSecondary }}>
              Loading tables...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: BORDER_RADIUS.medium }}>
            {error}
          </Alert>
        )}

        {!loading && filteredTables.length > 0 && (
          <Box sx={{ mb: 3, overflow: 'visible' }}>
            {renderTableGroup('Large Tables (>100K rows)', tableGroups.large, COLORS.error)}
            {renderTableGroup('Medium Tables (10K-100K rows)', tableGroups.medium, COLORS.warning)}
            {renderTableGroup('Small Tables (<10K rows)', tableGroups.small, COLORS.success)}
          </Box>
        )}

      </Box>

      {/* Action Buttons Section - Sticky at bottom */}
      <Box sx={{ 
        p: 3, 
        pt: 3, 
        borderTop: `2px solid ${COLORS.borderLight}`,
        backgroundColor: 'white',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleConfirmSelection}
                disabled={selectedTables.length === 0}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                  '&:disabled': {
                    background: COLORS.textMuted,
                  }
                }}
                startIcon={<CheckCircle />}
              >
                Build with {selectedTables.length} Selected {selectedTables.length === 1 ? 'Table' : 'Tables'}
              </Button>
              {selectedTables.length > 0 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: COLORS.textSecondary }}>
                  ⚡ Estimated: {selectedTables.length <= 10 ? '30-60 sec' : selectedTables.length <= 30 ? '2-3 min' : '5-10 min'}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => {
                  setSelectedTables([]);
                  if (onTablesSelected) {
                    onTablesSelected({
                      selectedTables: [],
                      selectMode: 'all',
                      totalAvailable: availableTables.length,
                    });
                  }
                }}
                sx={{
                  py: 1.5,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: `${COLORS.primary}10`,
                  }
                }}
                startIcon={<StorageIcon />}
              >
                Build with All {availableTables.length} Tables
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: COLORS.textSecondary }}>
                ⏱️ Estimated: 5-10 minutes
              </Typography>
            </Grid>
          </Grid>
      </Box>
    </Paper>
  );
};

export default TableSelector;
