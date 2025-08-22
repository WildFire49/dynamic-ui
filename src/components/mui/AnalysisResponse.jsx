import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import {
  TrendingUp,
  Insights,
  CheckCircle,
  Info,
  Lightbulb,
  Assessment
} from '@mui/icons-material';

const AnalysisResponse = ({ data, source }) => {
  const { status, answer } = data;

  // Parse the markdown-like content into sections
  const parseContent = (content) => {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Check for section headers
      if (trimmedLine.startsWith('- **') && trimmedLine.includes('**:')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const title = trimmedLine.match(/\*\*(.*?)\*\*/)?.[1] || '';
        currentSection = {
          title: title.replace(/[📊💡✅✨]/g, '').trim(),
          icon: getSectionIcon(title),
          content: []
        };
      } else if (currentSection && trimmedLine.startsWith('  - ')) {
        // Sub-bullet point
        currentSection.content.push({
          type: 'bullet',
          text: trimmedLine.substring(4)
        });
      } else if (currentSection && trimmedLine.startsWith('- ')) {
        // Main bullet point
        currentSection.content.push({
          type: 'bullet',
          text: trimmedLine.substring(2)
        });
      } else if (currentSection) {
        // Regular text
        currentSection.content.push({
          type: 'text',
          text: trimmedLine
        });
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const getSectionIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('data summary')) return <Assessment />;
    if (lowerTitle.includes('current situation')) return <Info />;
    if (lowerTitle.includes('key insights')) return <Insights />;
    if (lowerTitle.includes('opinions') || lowerTitle.includes('recommendations')) return <Lightbulb />;
    if (lowerTitle.includes('summary') || lowerTitle.includes('next steps')) return <CheckCircle />;
    return <TrendingUp />;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'primary';
    }
  };

  const sections = parseContent(answer);
  const validSections = sections.filter(section => 
    section.content && section.content.length > 0
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Assessment sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Analysis Report
            </Typography>
            {status && (
              <Chip 
                label={status.toUpperCase()} 
                color={getStatusColor(status)}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Stack>
          
          {source && (
            <Chip 
              label={`Source: ${source}`} 
              variant="outlined" 
              size="small"
              sx={{ fontStyle: 'italic' }}
            />
          )}
        </Box>

        {validSections?.length > 0 && <Divider sx={{ mb: 3 }} />}

        {/* Sections */}
        {validSections?.length > 0 && (
          <Stack spacing={3}>
            {validSections.map((section, index) => (
            <Paper 
              key={index}
              elevation={1}
              sx={{ 
                p: 2.5, 
                borderRadius: 2,
                backgroundColor: 'white',
                border: '1px solid #f0f0f0'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ color: 'primary.main' }}>
                  {section.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'text.primary'
                  }}
                >
                  {section.title}
                </Typography>
              </Stack>
              
              <Stack spacing={1.5}>
                {section.content.map((item, itemIndex) => (
                  <Box key={itemIndex}>
                    {item.type === 'bullet' ? (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            backgroundColor: 'primary.main',
                            mt: 1,
                            flexShrink: 0
                          }} 
                        />
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            lineHeight: 1.6,
                            color: 'text.primary'
                          }}
                        >
                          {item.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          lineHeight: 1.6,
                          color: 'text.secondary',
                          fontStyle: item.text.startsWith('Would you like') ? 'italic' : 'normal'
                        }}
                      >
                        {item.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default AnalysisResponse;
