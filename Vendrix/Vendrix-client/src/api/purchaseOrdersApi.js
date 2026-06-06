import api from './axiosInstance';
export const getPOs    = (params)    => api.get('/purchase-orders', { params });
export const getPO     = (id)        => api.get(`/purchase-orders/${id}`);
export const createPO  = (data)      => api.post('/purchase-orders', data);
export const updatePOStatus = (id, status) => api.patch(`/purchase-orders/${id}/status`, { status });
