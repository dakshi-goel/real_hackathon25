import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const propertyApi = {
  getAllProperties: () => api.get('/api/properties'),
  getPropertyById: (id) => api.get(`/api/properties/${id}`),
  searchProperties: (criteria) => api.post('/api/properties/search', criteria)
};

export default api;