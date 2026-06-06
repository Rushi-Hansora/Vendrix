import api from './axiosInstance';
export const getQuotations   = (params)    => api.get('/quotations', { params });
export const getQuotation    = (id)        => api.get(`/quotations/${id}`);
export const createQuotation = (data)      => api.post('/quotations', data);
export const updateQuotation = (id, data)  => api.put(`/quotations/${id}`, data);
