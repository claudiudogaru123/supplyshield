import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

export const suppliersApi = {
  getAll: () => api.get('/api/suppliers/').then(r => r.data),
  getOne: (id: string) => api.get(`/api/suppliers/${id}`).then(r => r.data),
  create: (data: any) => api.post('/api/suppliers/', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/api/suppliers/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/suppliers/${id}`).then(r => r.data),
}

export const assessmentsApi = {
  start: (supplierId: string) => api.post(`/api/assessments/${supplierId}/start`).then(r => r.data),
  list: (supplierId: string) => api.get(`/api/assessments/${supplierId}/list`).then(r => r.data),
  get: (assessmentId: string) => api.get(`/api/assessments/detail/${assessmentId}`).then(r => r.data),
  saveAnswers: (assessmentId: string, answers: Record<string, number>) =>
    api.put(`/api/assessments/${assessmentId}/answers`, { answers }).then(r => r.data),
  complete: (assessmentId: string) => api.post(`/api/assessments/${assessmentId}/complete`).then(r => r.data),
}

export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats').then(r => r.data),
  getHeatmap: () => api.get('/api/dashboard/heatmap').then(r => r.data),
}

export const recommendationsApi = {
  get: (supplierId: string) => api.get(`/api/recommendations/${supplierId}`).then(r => r.data),
}

export default api