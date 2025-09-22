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
    // Determine the record key and mismatch type based on data structure
    let recordKey, mismatchType, xmmValue, samValue;
    
    // Prioritize mapped fields from our table generation
    if (row.key_ref && row.mismatch_type) {
      recordKey = row.key_ref;
      mismatchType = row.mismatch_type;
      xmmValue = row.xmm_value || 'N/A';
      samValue = row.sam_value || 'N/A';
    }
    // Handle new format for different mismatch types
    else if (row.Reference) {
      recordKey = row.Reference;
      
      // Message type mismatches
      if (row.KTP_msg_type && row.XMM_msg_type && row.SAM_Identifier) {
        mismatchType = 'Message Type Mismatch';
        xmmValue = `${row.XMM_msg_type} (${row.XMM_normalized_msg_code || 'N/A'})`;
        samValue = `${row.SAM_Identifier} (${row.SAM_normalized_msg_code || 'N/A'})`;
      }
      // Amount mismatches - fix field name from XMM_amt to XMM_amount
      else if (row.KTP_amount !== undefined && row.XMM_amount !== undefined && row.SAM_Cur_Amt) {
        mismatchType = 'Amount Mismatch';
        xmmValue = row.XMM_amount?.toLocaleString() || row.XMM_amount;
        samValue = row.SAM_Cur_Amt;
      }
      // BIC mismatches
      else if (row.omh_sent_bic && row.omh_recv_bic && row.Correspondent) {
        mismatchType = 'BIC Mismatch';
        xmmValue = `${row.omh_sent_bic} -> ${row.omh_recv_bic}`;
        samValue = `${row.Correspondent} (${row.Sender_Receiver})`;
      }
    }
    // Fallback for unknown format
    else {
      recordKey = row.sender_ref || row.ref || 'Unknown';
      mismatchType = 'Unknown Mismatch';
      xmmValue = 'N/A';
      samValue = 'N/A';
    }
    
    // Use compound key to match the review store logic
    // The review store expects the format: key_ref_mismatch_type
    // But for new format, we need to create a compatible key
    let reviewKey;
    if (row.key_ref && row.mismatch_type) {
      // Legacy format - use as is
      reviewKey = `${row.key_ref}_${row.mismatch_type}`;
    } else {
      // New format - create compatible key
      reviewKey = `${recordKey}_${mismatchType}`;
    }
    
    const review = reviews[reviewKey] || {};
    
    return {
      'Record Key': recordKey,
      'Mismatch Type': mismatchType,
      'XMM Value': xmmValue,
      'SAM Value': samValue,
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
