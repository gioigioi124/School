import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Supabase token will be added here
api.interceptors.request.use((config) => {
  // TODO: Get Supabase session token and attach to Authorization header
  return config;
});

export default api;
