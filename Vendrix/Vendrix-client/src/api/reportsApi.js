import api from './axiosInstance';
export const getLogs    = (params) => api.get('/activity-log', { params });
export const getSummary = ()       => api.get('/reports/summary');
