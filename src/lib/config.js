// Centralized configuration for client-side environment variables
// Use NEXT_PUBLIC_ prefix so they are available in the browser

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
export const UPLOAD_API_URL = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'http://localhost:8000/api/upload';
export const CHAT_ENDPOINT = '/chat';

// Chroma DB Configuration
export const CHROMA_HOST = process.env.NEXT_PUBLIC_CHROMA_HOST || '3.6.132.24';
export const CHROMA_PORT = process.env.NEXT_PUBLIC_CHROMA_PORT || '8000';
export const CHROMA_BASE_URL = `http://${CHROMA_HOST}:${CHROMA_PORT}`;

export const getApiUrl = (path = '') => `${API_BASE_URL}${path}`;
export const getChromaUrl = (path = '') => `${CHROMA_BASE_URL}${path}`;
