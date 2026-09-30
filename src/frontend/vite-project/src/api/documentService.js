import axiosClient from './axiosClient';

// Fájlfeltöltés az API-nak
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// Elemzési eredmény lekérése
export async function getDocumentAnalysis(documentId) {
  const response = await axiosClient.get(`/api/documents/${documentId}/result`);
  return response.data;
}