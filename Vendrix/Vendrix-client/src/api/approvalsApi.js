import api from './axiosInstance';
export const getPending   = ()                     => api.get('/approvals/pending');
export const getApprovals = (params)               => api.get('/approvals', { params });
export const processApproval = (data)              => api.post('/approvals', data);
export const approve      = (id, remarks)          => api.post(`/approvals/${id}/approve`, { remarks });
export const reject       = (id, remarks)          => api.post(`/approvals/${id}/reject`, { remarks });
