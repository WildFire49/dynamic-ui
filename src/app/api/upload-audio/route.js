import { NextRequest, NextResponse } from 'next/server';

const UPLOAD_API_URL = process.env.UPLOAD_API_URL;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const fileName = formData.get('fileName');
    
    if (!audioFile || !fileName) {
      return NextResponse.json(
        { error: 'Audio file and fileName are required' },
        { status: 400 }
      );
    }

    // Create form data for the upload API
    const uploadFormData = new FormData();
    uploadFormData.append('file', audioFile, fileName);
    uploadFormData.append('folder', 'recordings');
    
    // Upload to the external API
    const response = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      body: uploadFormData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      fileUrl: result.fileUrl || result.url || `${UPLOAD_API_URL}/${fileName}`,
      fileName,
      message: 'Audio uploaded successfully'
    });

  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload audio',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
