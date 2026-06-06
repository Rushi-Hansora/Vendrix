import api from './axiosInstance';
export const getRFQs   = (params)    => api.get('/rfq', { params });
export const getRFQ    = (id)        => api.get(`/rfq/${id}`);
export const createRFQ = (data)      => api.post('/rfq', data);
export const updateRFQ = (id, data)  => api.put(`/rfq/${id}`, data);
export const deleteRFQ = (id)        => api.delete(`/rfq/${id}`);
