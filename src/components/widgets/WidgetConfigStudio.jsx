import React, { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataGrid } from '@mui/x-data-grid';

// Color palettes
const COLOR_PALETTES = {
  default: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  ocean: ['#0EA5E9', '#06B6D4', '#14B8A6', '#22C55E', '#84CC16', '#EAB308'],
  sunset: ['#F97316', '#EF4444', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6'],
  forest: ['#22C55E', '#16A34A', '#15803D', '#166534', '#14532D', '#052E16'],
  monochrome: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'],
};

// Widget type configurations
const WIDGET_TYPES = [
  { id: 'bar', label: 'Bar Chart', icon: BarChartIcon, description: 'Compare values across categories' },
  { id: 'line', label: 'Line Chart', icon: LineChartIcon, description: 'Show trends over time' },
  { id: 'area', label: 'Area Chart', icon: TrendingUpIcon, description: 'Visualize cumulative data' },
  { id: 'pie', label: 'Pie Chart', icon: PieChartIcon, description: 'Show proportions of a whole' },
  { id: 'table', label: 'Data Table', icon: TableChartIcon, description: 'Display detailed data rows' },
  { id: 'kpi', label: 'KPI Cards', icon: SpeedIcon, description: 'Highlight key metrics' },
  { id: 'summary', label: 'Summary', icon: AssessmentIcon, description: 'Text-based insights' },
];

/**
 * WidgetConfigStudio - Configure and preview dashboard widgets
 */
const WidgetConfigStudio = ({ 
  widgets = [],
  selectedWidget = null,
  isOpen = false,
  onClose,
  onSave,
  onWidgetSelect,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedWidgetId, setSelectedWidgetId] = useState(selectedWidget?.id || null);
  
  // Configuration state
  const [config, setConfig] = useState({
    widgetType: 'bar',
    title: '',
    colorPalette: 'default',
    showLegend: true,
    showGrid: true,
    labelKey: '',
    valueKeys: [],
    aggregation: 'none',
  });

  // Get currently selected widget
  const currentWidget = useMemo(() => {
    return widgets.find(w => w.id === selectedWidgetId) || selectedWidget;
  }, [widgets, selectedWidgetId, selectedWidget]);

  // Extract data from widget with ID generation
  const widgetData = useMemo(() => {
    if (!currentWidget) return [];
    
    const rawData = 
      currentWidget.pipelineData ||
      currentWidget.supportingData ||
      currentWidget.data?.pipelineData ||
      currentWidget.data?.dataGrid?.gridRows ||
      currentWidget.data?.supportingData ||
      [];
    
    // Ensure each row has an id
    return rawData.map((row, index) => ({
      id: row.id ?? `row-${index}`,
      ...row,
    }));
  }, [currentWidget]);

  // Get available columns from data
  const availableColumns = useMemo(() => {
    if (widgetData.length === 0) return [];
    const firstRow = widgetData[0];
    return Object.keys(firstRow).filter(k => k !== 'id' && !k.startsWith('_'));
  }, [widgetData]);

  // Detect numeric and string columns
  const { numericColumns, stringColumns } = useMemo(() => {
    if (widgetData.length === 0) return { numericColumns: [], stringColumns: [] };
    const firstRow = widgetData[0];
    const numeric = [];
    const strings = [];
    
    availableColumns.forEach(col => {
      if (typeof firstRow[col] === 'number') {
        numeric.push(col);
      } else {
        strings.push(col);
      }
    });
    
    return { numericColumns: numeric, stringColumns: strings };
  }, [widgetData, availableColumns]);

  // Auto-select label and value keys
  React.useEffect(() => {
    if (stringColumns.length > 0 && !config.labelKey) {
      setConfig(prev => ({ ...prev, labelKey: stringColumns[0] }));
    }
    if (numericColumns.length > 0 && config.valueKeys.length === 0) {
      setConfig(prev => ({ ...prev, valueKeys: [numericColumns[0]] }));
    }
  }, [stringColumns, numericColumns]);

  // Update config when widget changes
  React.useEffect(() => {
    if (currentWidget) {
      setConfig(prev => ({
        ...prev,
        title: currentWidget.title || '',
        widgetType: currentWidget.viewMode === 'table' ? 'table' : 
                    currentWidget.chartType || 'bar',
      }));
    }
  }, [currentWidget]);

  // Format number for display
  const formatValue = (value) => {
    if (typeof value !== 'number') return value;
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Render chart preview
  const renderChartPreview = () => {
    if (widgetData.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 300,
          color: 'text.secondary' 
        }}>
          <Typography>Select a widget to preview</Typography>
        </Box>
      );
    }

    const colors = COLOR_PALETTES[config.colorPalette] || COLOR_PALETTES.default;
    const labelKey = config.labelKey || stringColumns[0] || availableColumns[0];
    const valueKeys = config.valueKeys.length > 0 ? config.valueKeys : numericColumns.slice(0, 2);

    switch (config.widgetType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={widgetData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
              <XAxis 
                dataKey={labelKey} 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatValue} />
              <RechartsTooltip formatter={(value) => formatValue(value)} />
              {config.showLegend && <Legend />}
              {valueKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={widgetData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
              <XAxis 
                dataKey={labelKey} 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatValue} />
              <RechartsTooltip formatter={(value) => formatValue(value)} />
              {config.showLegend && <Legend />}
              {valueKeys.map((key, idx) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[idx % colors.length]} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={widgetData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                {valueKeys.map((key, idx) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
              <XAxis 
                dataKey={labelKey} 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatValue} />
              <RechartsTooltip formatter={(value) => formatValue(value)} />
              {config.showLegend && <Legend />}
              {valueKeys.map((key, idx) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[idx % colors.length]}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = widgetData.slice(0, 8).map((row, idx) => ({
          name: row[labelKey] || `Item ${idx + 1}`,
          value: row[valueKeys[0]] || 0,
        }));
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#6B7280', strokeWidth: 1 }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => formatValue(value)} />
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'table':
        const columns = availableColumns.map(col => ({
          field: col,
          headerName: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          flex: 1,
          minWidth: 120,
          renderCell: (params) => {
            const value = params.value;
            if (typeof value === 'number') {
              return formatValue(value);
            }
            return value;
          },
        }));
        
        return (
          <Box sx={{ height: 300, width: '100%' }}>
            <DataGrid
              rows={widgetData}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              disableSelectionOnClick
              density="compact"
              getRowId={(row) => row.id}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #F3F4F6',
                },
              }}
            />
          </Box>
        );

      case 'kpi':
        return (
          <Grid container spacing={2}>
            {numericColumns.slice(0, 4).map((col, idx) => {
              const total = widgetData.reduce((sum, row) => sum + (row[col] || 0), 0);
              return (
                <Grid item xs={6} key={col}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${colors[idx % colors.length]}15 0%, ${colors[idx % colors.length]}05 100%)`,
                      border: `1px solid ${colors[idx % colors.length]}30`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      {col.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: colors[idx % colors.length], mt: 0.5 }}>
                      {formatValue(total)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total from {widgetData.length} records
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        );

      default:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography color="text.secondary">Select a visualization type</Typography>
          </Box>
        );
    }
  };

  // Handle save
  const handleSave = () => {
    if (onSave && currentWidget) {
      onSave({
        ...currentWidget,
        viewMode: config.widgetType === 'table' ? 'table' : 'chart',
        chartType: config.widgetType,
        config: {
          ...config,
          title: config.title || currentWidget.title,
        },
      });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 700, md: 900 },
          bgcolor: '#F9FAFB',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DashboardIcon />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Widget Configuration Studio
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Configure and preview your dashboard widgets
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
          }}
        >
          <Tab icon={<DashboardIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Widgets" />
          <Tab icon={<SettingsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Configure" />
          <Tab icon={<VisibilityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Preview" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Tab 0: Widget List */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Select a widget to configure ({widgets.length} available)
            </Typography>
            <Grid container spacing={2}>
              {widgets.map((widget) => (
                <Grid item xs={12} sm={6} key={widget.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: selectedWidgetId === widget.id ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#3B82F6',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => {
                        setSelectedWidgetId(widget.id);
                        onWidgetSelect?.(widget);
                      }}
                      sx={{ p: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: alpha('#3B82F6', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <BarChartIcon sx={{ color: '#3B82F6' }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {widget.title || 'Untitled Widget'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(widget.pipelineData?.length || widget.data?.pipelineData?.length || 0)} rows
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                            <Chip label={widget.type || 'pipeline'} size="small" sx={{ fontSize: 10, height: 20 }} />
                            <Chip label={widget.viewMode || 'auto'} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                          </Box>
                        </Box>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 1: Configuration */}
        {activeTab === 1 && (
          <Box>
            {!currentWidget ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <DashboardIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                <Typography color="text.secondary">Select a widget from the Widgets tab to configure</Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {/* Widget Type Selection */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Visualization Type
                  </Typography>
                  <Grid container spacing={1.5}>
                    {WIDGET_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = config.widgetType === type.id;
                      return (
                        <Grid item xs={6} sm={4} md={3} key={type.id}>
                          <Tooltip title={type.description} arrow>
                            <Paper
                              elevation={0}
                              onClick={() => setConfig(prev => ({ ...prev, widgetType: type.id }))}
                              sx={{
                                p: 1.5,
                                cursor: 'pointer',
                                borderRadius: 1.5,
                                border: isSelected ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                                bgcolor: isSelected ? alpha('#3B82F6', 0.05) : 'white',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                <Icon sx={{ fontSize: 24, color: isSelected ? '#3B82F6' : '#6B7280' }} />
                                <Typography variant="caption" sx={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? '#3B82F6' : 'text.secondary' }}>
                                  {type.label}
                                </Typography>
                              </Box>
                            </Paper>
                          </Tooltip>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>

                {/* Data Mapping */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Data Mapping
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Label Column</InputLabel>
                        <Select
                          value={config.labelKey}
                          label="Label Column"
                          onChange={(e) => setConfig(prev => ({ ...prev, labelKey: e.target.value }))}
                        >
                          {availableColumns.map(col => (
                            <MenuItem key={col} value={col}>
                              {col.replace(/_/g, ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Value Columns</InputLabel>
                        <Select
                          multiple
                          value={config.valueKeys}
                          label="Value Columns"
                          onChange={(e) => setConfig(prev => ({ ...prev, valueKeys: e.target.value }))}
                          renderValue={(selected) => selected.join(', ')}
                        >
                          {numericColumns.map(col => (
                            <MenuItem key={col} value={col}>
                              {col.replace(/_/g, ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Appearance */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaletteIcon sx={{ fontSize: 18 }} /> Appearance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Widget Title"
                        value={config.title}
                        onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Color Palette</InputLabel>
                        <Select
                          value={config.colorPalette}
                          label="Color Palette"
                          onChange={(e) => setConfig(prev => ({ ...prev, colorPalette: e.target.value }))}
                        >
                          {Object.keys(COLOR_PALETTES).map(palette => (
                            <MenuItem key={palette} value={palette}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 0.25 }}>
                                  {COLOR_PALETTES[palette].slice(0, 4).map((color, i) => (
                                    <Box key={i} sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: color }} />
                                  ))}
                                </Box>
                                <Typography sx={{ textTransform: 'capitalize' }}>{palette}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.showLegend}
                            onChange={(e) => setConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                            size="small"
                          />
                        }
                        label="Legend"
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.showGrid}
                            onChange={(e) => setConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
                            size="small"
                          />
                        }
                        label="Grid"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            )}
          </Box>
        )}

        {/* Tab 2: Preview */}
        {activeTab === 2 && (
          <Box>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: 'white' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                {config.title || currentWidget?.title || 'Widget Preview'}
              </Typography>
              {renderChartPreview()}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', bgcolor: 'white', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!currentWidget}
          sx={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          }}
        >
          Save Configuration
        </Button>
      </Box>
    </Drawer>
  );
};

export default WidgetConfigStudio;
