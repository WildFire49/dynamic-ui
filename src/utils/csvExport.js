// CSV Export utility functions

export const downloadCSV = (data, filename) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string') {
        const escaped = value.replace(/"/g, '""');
        return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      }
      return value || '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

export const generateAuditReport = (tableName, tableData, reviews) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${tableName.replace(/[^a-zA-Z0-9]/g, '_')}_audit_report_${timestamp}.csv`;
  
  const auditData = tableData.map(row => {
    // Use compound key to match the review store logic
    const uniqueKey = `${row.key_ref}_${row.mismatch_type}`;
    const review = reviews[uniqueKey] || {};
    return {
      'Record Key': row.key_ref,
      'Mismatch Type': row.mismatch_type,
      'XMM Value': row.xmm_value,
      'SAM Value': row.sam_value,
      'Review Status': review.status || 'Pending Review',
      'Reviewer Comment': review.comment || '',
      'Reviewed By': review.reviewedBy || '',
      'Review Date': review.timestamp ? new Date(review.timestamp).toLocaleDateString() : '',
      'Marked as Not Mismatch': review.notMismatch ? 'Yes' : 'No',
      'Export Date': new Date().toLocaleDateString(),
      'Export Time': new Date().toLocaleTimeString()
    };
  });
  
  downloadCSV(auditData, filename);
  return filename;
};
