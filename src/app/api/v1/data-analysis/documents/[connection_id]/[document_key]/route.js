import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000/api/v1/data-analysis';

// DELETE - Delete a specific document
export async function DELETE(request, { params }) {
  const { connection_id, document_key } = params;
  
  try {
    console.log('Deleting document:', { connection_id, document_key });
    
    const response = await fetch(`${BACKEND_URL}/documents/${connection_id}/${document_key}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      // No content response for successful deletion
      return NextResponse.json({ 
        success: true, 
        message: 'Document deleted successfully' 
      });
    }

    const data = await response.json();
    console.log('Backend delete response:', { status: response.status, data });
    
    if (!response.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.detail || data.message || 'Failed to delete document' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete Document API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete document', error: error.message },
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
