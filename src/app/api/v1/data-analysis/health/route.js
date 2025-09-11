import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "data-analysis",
    documents_in_memory: 5,
    features: ["document_upload", "data_analysis", "graph_optimization"]
  });
}
