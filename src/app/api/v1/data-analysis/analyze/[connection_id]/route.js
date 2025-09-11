import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000/api/v1/data-analysis';

export async function POST(request, { params }) {
  const { connection_id } = params;
  
  try {
    const body = await request.json();
    console.log('Analysis request:', { connection_id, body });
    
    // Forward the request to the backend service
    const response = await fetch(`${BACKEND_URL}/analyze/${connection_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Backend response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.detail || data.message || 'Analysis failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Analysis failed', error: error.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
