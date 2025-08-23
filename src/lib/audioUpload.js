import { UPLOAD_API_URL } from './config';

// Audio upload client for voice recordings
export const uploadAudioFile = async (audioBlob, fileName) => {
  console.log('Uploading audio to:', UPLOAD_API_URL);
  
  try {
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    
    // Upload to configured API endpoint
    const response = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Audio upload successful:', result);
    
    // Construct proper file URL based on response data
    let fileUrl;
    if (result.fileUrl || result.url) {
      fileUrl = result.fileUrl || result.url;
    } else if (result.data?.endpoint && result.data?.bucket_name && result.data?.minio_key) {
      // Construct MinIO URL
      fileUrl = `http://${result.data.endpoint}/${result.data.bucket_name}/${result.data.minio_key}`;
    } else if (result.data?.minio_key) {
      // Fallback construction
      fileUrl = `${UPLOAD_API_URL.replace('/api/upload', '')}/files/${result.data.minio_key}`;
    } else {
      // Final fallback
      fileUrl = `${UPLOAD_API_URL}/${fileName}`;
    }
    
    console.log('Constructed file URL:', fileUrl);
    
    return {
      success: true,
      fileUrl: fileUrl,
      fileName: fileName,
      key: result.key || result.data?.minio_key || result.minio_key || fileName,
      audioKey: result.data?.minio_key || result.minio_key || result.key || fileName
    };
    
  } catch (error) {
    console.error('Audio upload error:', error);
    
    // Fallback to local storage
    const audioUrl = URL.createObjectURL(audioBlob);
    return {
      success: true,
      fileUrl: audioUrl,
      fileName,
      isLocal: true,
      error: 'Using local storage due to upload issues'
    };
  }
};

export const generateAudioFileName = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomId = Math.random().toString(36).substring(2, 8);
  return `voice-${timestamp}-${randomId}.webm`;
};
