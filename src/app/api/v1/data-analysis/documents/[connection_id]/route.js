import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000/api/v1/data-analysis';

// GET - List documents for a connection
export async function GET(request, { params }) {
  const { connection_id } = params;
  
  try {
    console.log('Listing documents for connection:', connection_id);
    
    const response = await fetch(`${BACKEND_URL}/documents/${connection_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Backend documents response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.detail || data.message || 'Failed to list documents' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Documents API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list documents', error: error.message },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
