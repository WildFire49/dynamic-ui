import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Stack,
  Alert,
  Grid
} from '@mui/material';
import {
  Search,
  Rule,
  Person,
  CheckCircle,
  Info,
  Warning,
  MonetizationOn
} from '@mui/icons-material';

const IncentiveRulesResponse = ({ data, source }) => {
  const { action, message, result } = data;

  // Parse rules from the result text
  const parseRules = (text) => {
    const rules = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Format 1: "- If a User does X, they receive Y"
      if (trimmedLine.startsWith('- If a User does') && trimmedLine.includes('they receive')) {
        const ruleMatch = trimmedLine.match(/- If a User does (.+?), they receive (.+?)\./);
        if (ruleMatch) {
          rules.push({
            condition: ruleMatch[1],
            reward: ruleMatch[2]
          });
        }
      }
      
      // Format 2: "- X% completion: Y points"
      else if (trimmedLine.match(/^- \d+% completion: \d+ points$/)) {
        const ruleMatch = trimmedLine.match(/^- (\d+)% completion: (\d+ points)$/);
        if (ruleMatch) {
          rules.push({
            condition: `${ruleMatch[1]}% of Collections completed`,
            reward: ruleMatch[2]
          });
        }
      }
      
      // Format 3: "- X completion: Y points" (without %)
      else if (trimmedLine.match(/^- \d+% .+?: \d+ points$/)) {
        const ruleMatch = trimmedLine.match(/^- (\d+% .+?): (\d+ points)$/);
        if (ruleMatch) {
          rules.push({
            condition: ruleMatch[1],
            reward: ruleMatch[2]
          });
        }
      }
    }
    
    return rules;
  };

  // Extract key information from the result
  const extractKeyInfo = (text) => {
    const info = {
      userName: null,
      completionPercentage: null,
      pointsEarned: null,
      status: null
    };

    // Extract user name
    const userMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    if (userMatch) {
      info.userName = userMatch[1];
    }

    // Extract completion percentage
    const percentageMatch = text.match(/(\d+\.?\d*)%/);
    if (percentageMatch) {
      info.completionPercentage = parseFloat(percentageMatch[1]);
    }

    // Extract points or earnings
    const pointsMatch = text.match(/(\d+) points/);
    const earningsMatch = text.match(/(\d+) rupees/);
    if (pointsMatch) {
      info.pointsEarned = parseInt(pointsMatch[1]);
    } else if (earningsMatch) {
      info.pointsEarned = `₹${earningsMatch[1]}`;
    }

    // Determine status
    if (text.includes('does not meet') || text.includes('does not earn')) {
      info.status = 'not_eligible';
    } else if (info.pointsEarned) {
      info.status = 'eligible';
    } else if (text.includes('need to know') || text.includes('Please provide')) {
      info.status = 'pending_info';
    } else {
      info.status = 'pending';
    }

    return info;
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'search': return <Search />;
      case 'calculate': return <MonetizationOn />;
      default: return <Rule />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'eligible': return 'success';
      case 'not_eligible': return 'error';
      case 'pending': return 'warning';
      case 'pending_info': return 'info';
      default: return 'info';
    }
  };

  const rules = parseRules(result);
  const keyInfo = extractKeyInfo(result);

  return (
    <Box sx={{ width: '100%', maxWidth: 'none' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fafbfc 0%, #f8faff 100%)',
          border: '1px solidrgb(98, 151, 242)'
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            {getActionIcon(action)}
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00468e' }}>
              Incentive Rules
            </Typography>
            {/* <Chip 
              label={action?.toUpperCase() || 'RULES'} 
              color="warning"
              size="small"
              sx={{ fontWeight: 'bold' }}
            /> */}
          </Stack>
          
          
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Status Message */}
        {message && (
          <Alert 
            severity="info" 
            icon={<Info />}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {message}
            </Typography>
          </Alert>
        )}

        {/* Key Information */}
        {(keyInfo.userName || keyInfo.completionPercentage !== null || keyInfo.pointsEarned || keyInfo.status !== 'pending') && (
          <Paper 
            elevation={1}
            sx={{ 
              p: 2.5, 
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'white',
              border: '1px solid #ffcc02'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Person sx={{ color: '#00468e' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Employee Summary
              </Typography>
            </Stack>
            
            <Grid container spacing={2}>
              {keyInfo.userName && (
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Employee
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {keyInfo.userName}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {keyInfo.completionPercentage !== null && (
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {keyInfo.completionPercentage}%
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {keyInfo.status && keyInfo.status !== 'pending' && (
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={keyInfo.status.replace('_', ' ').toUpperCase()} 
                      color={getStatusColor(keyInfo.status)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Grid>
              )}
              
              {keyInfo.pointsEarned && (
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Earned
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: keyInfo.status === 'eligible' ? '#2e7d32' : '#d32f2f'
                      }}
                    >
                      {keyInfo.pointsEarned}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Rules Section */}
        {rules.length > 0 && (
          <Paper 
            elevation={1}
            sx={{ 
              p: 2.5, 
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'white',
              border: '1px solid #f0f0f0'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Rule sx={{ color: '#00468e' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Applicable Rules
              </Typography>
            </Stack>
            
            <Stack spacing={2}>
              {rules.map((rule, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    p: 2, 
                    borderRadius: 1, 
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {rule.condition}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reward: <strong>{rule.reward}</strong>
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Detailed Result */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2.5, 
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #f0f0f0'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Info sx={{ color: '#00468e' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Detailed Analysis
            </Typography>
          </Stack>
          
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.6,
              color: 'text.primary',
              whiteSpace: 'pre-line'
            }}
          >
            {result}
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
};

export default IncentiveRulesResponse;
