import { NextResponse } from 'next/server';

const CHROMA_HOST = process.env.NEXT_PUBLIC_CHROMA_HOST || '3.6.132.24';
const CHROMA_PORT = process.env.NEXT_PUBLIC_CHROMA_PORT || '8000';
const CHROMA_BASE_URL = `http://${CHROMA_HOST}:${CHROMA_PORT}`;

export async function GET(request) {
  try {
    const response = await fetch(`${CHROMA_BASE_URL}/api/v1/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `ChromaDB returned ${response.status}`, collections: [], count: 0 },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying ChromaDB request:', error);
    return NextResponse.json(
      { error: error.message, collections: [], count: 0 },
      { status: 500 }
    );
  }
}
