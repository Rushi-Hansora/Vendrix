import api from './axiosInstance';
export const getInvoices   = (params) => api.get('/invoices', { params });
export const getInvoice    = (id)     => api.get(`/invoices/${id}`);
export const createInvoice = (data)   => api.post('/invoices', data);
export const sendInvoice   = (id)     => api.post(`/invoices/${id}/send`);
export const getInvoiceDownloadUrl = (id) => api.get(`/invoices/${id}/download`);
export const updateInvoiceStatus = (id, status) => api.patch(`/invoices/${id}/status`, { status });
