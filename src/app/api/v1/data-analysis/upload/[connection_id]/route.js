import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000/api/v1/data-analysis';

export async function POST(request, { params }) {
  const { connection_id } = params;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const context = formData.get('context') || '';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('Upload request:', { connection_id, filename: file.name, context });

    // Forward the request to the backend service
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    if (context) {
      backendFormData.append('context', context);
    }

    const response = await fetch(`${BACKEND_URL}/upload/${connection_id}`, {
      method: 'POST',
      body: backendFormData,
    });

    const data = await response.json();
    console.log('Backend upload response:', { status: response.status, data });

    if (!response.ok) {
      console.error('Backend upload error:', data);
      return NextResponse.json(
        { success: false, message: data.detail || data.message || 'Upload failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed', error: error.message },
      { status: 500 }
    );
  }
}
