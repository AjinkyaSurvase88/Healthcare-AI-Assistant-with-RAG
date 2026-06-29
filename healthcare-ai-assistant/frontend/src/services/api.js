import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

export const askQuestion = async (question) => {
  const response = await api.post('/ask', { question });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/ingest', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};
