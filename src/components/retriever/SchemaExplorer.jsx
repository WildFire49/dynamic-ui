import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  TableChart as TableIcon,
  ViewColumn as ColumnIcon,
  Link as LinkIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import kgSqlService from '@/services/kgSqlService';
import { COLORS, COMPONENT_STYLES, SPACING } from '@/styles/retrieverStyles';

const SchemaExplorer = ({ schema, kgStatus }) => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [searchPattern, setSearchPattern] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetails, setTableDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (schema && kgStatus) {
      fetchTables();
    }
  }, [schema, kgStatus]);

  useEffect(() => {
    if (searchPattern) {
      const filtered = tables.filter((table) =>
        table.name.toLowerCase().includes(searchPattern.toLowerCase())
      );
      setFilteredTables(filtered);
    } else {
      setFilteredTables(tables);
    }
  }, [searchPattern, tables]);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await kgSqlService.getTables(schema);
      setTables(response.data);
      setFilteredTables(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = async (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);

    try {
      const response = await kgSqlService.getTableDetails(schema, tableName);
      setTableDetails(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch table details');
    } finally {
      setLoading(false);
    }
  };

  if (!schema || !kgStatus) {
    return (
      <Paper sx={COMPONENT_STYLES.connectionCard}>
        <Alert severity="info">
          Please connect to database and build knowledge graph to explore schema
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={COMPONENT_STYLES.connectionCard}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: SPACING.md }}>
        <TableIcon sx={{ fontSize: 32, color: COLORS.success, mr: SPACING.sm }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
            Schema Explorer
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            Browse tables, columns, and relationships
          </Typography>
        </Box>
        <Chip
          label={`${tables.length} Tables`}
          color="primary"
          size="small"
          sx={COMPONENT_STYLES.statusChip}
        />
      </Box>

      <TextField
        fullWidth
        placeholder="Search tables..."
        value={searchPattern}
        onChange={(e) => setSearchPattern(e.target.value)}
        sx={{ ...COMPONENT_STYLES.inputField, mb: SPACING.md }}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading && !tableDetails && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: SPACING.lg }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: SPACING.md }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={SPACING.sm}>
        {filteredTables.map((table) => (
          <Grid item xs={12} sm={6} md={4} key={table.name}>
            <Box
              sx={{
                ...COMPONENT_STYLES.tableCard,
                borderColor: selectedTable === table.name ? COLORS.primary : COLORS.border,
                borderWidth: selectedTable === table.name ? 2 : 1,
              }}
              onClick={() => handleTableClick(table.name)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TableIcon sx={{ fontSize: 20, color: COLORS.primary, mr: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                  {table.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${table.column_count} cols`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
                <Chip
                  label={`${table.row_count?.toLocaleString() || 0} rows`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
                {table.has_primary_key && (
                  <Chip
                    label="PK"
                    size="small"
                    color="success"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
                {table.has_foreign_keys && (
                  <Chip
                    label="FK"
                    size="small"
                    color="info"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {tableDetails && (
        <Box sx={{ mt: SPACING.lg }}>
          <Typography variant="h6" sx={{ mb: SPACING.md, fontWeight: 600 }}>
            Table Details: {tableDetails.table.name}
          </Typography>

          {/* Columns */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ColumnIcon sx={{ mr: 1, color: COLORS.primary }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Columns ({tableDetails.columns.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {tableDetails.columns.map((column, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: SPACING.sm,
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                      {column.name}
                    </Typography>
                    <Chip label={column.data_type} size="small" variant="outlined" />
                    {column.is_primary_key && (
                      <Chip label="PK" size="small" color="success" icon={<KeyIcon />} />
                    )}
                    {column.is_foreign_key && (
                      <Chip label="FK" size="small" color="info" icon={<LinkIcon />} />
                    )}
                    {!column.nullable && (
                      <Chip label="NOT NULL" size="small" color="error" />
                    )}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* References */}
          {tableDetails.references && tableDetails.references.length > 0 && (
            <Accordion sx={{ mt: SPACING.sm }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkIcon sx={{ mr: 1, color: COLORS.info }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    References ({tableDetails.references.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {tableDetails.references.map((ref, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: SPACING.sm,
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#bbdefb' },
                      }}
                      onClick={() => handleTableClick(ref.name)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ref.schema}.{ref.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Referenced By */}
          {tableDetails.referenced_by && tableDetails.referenced_by.length > 0 && (
            <Accordion sx={{ mt: SPACING.sm }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkIcon sx={{ mr: 1, color: COLORS.warning }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Referenced By ({tableDetails.referenced_by.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {tableDetails.referenced_by.map((ref, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: SPACING.sm,
                        backgroundColor: '#fff3e0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#ffe0b2' },
                      }}
                      onClick={() => handleTableClick(ref.name)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ref.schema}.{ref.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SchemaExplorer;
