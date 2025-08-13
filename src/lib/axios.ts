// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://4frnn03l-3000.inc1.devtunnels.ms/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;