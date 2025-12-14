import axiosInstance from './axios';
import { Worker, Payroll, DashboardStats, MonthlyData, User } from '@/types';

// Auth API
export async function register(data: any): Promise<{ data: User, access_token: string }> {
  const { data: response } = await axiosInstance.post('/auth/register', data);
  return response;
}

export async function login(data: any): Promise<{ data: User, access_token: string }> {
  const { data: response } = await axiosInstance.post('/auth/login', data);
  return response;
}

export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout');
}

export async function getUser(): Promise<User> {
  const { data } = await axiosInstance.get('/auth/user');
  return data;
}

// Workers API
export async function getWorkers(): Promise<Worker[]> {
  const { data } = await axiosInstance.get('/workers');
  return data;
}

export async function getWorker(id: string): Promise<Worker | undefined> {
  const { data } = await axiosInstance.get(`/workers/${id}`);
  return data;
}

export async function createWorker(worker: Omit<Worker, 'id' | 'created_at' | 'updated_at'>): Promise<Worker> {
  const { data } = await axiosInstance.post('/workers', worker);
  return data;
}

export async function updateWorker(id: string, updates: Partial<Worker>): Promise<Worker> {
  const { data } = await axiosInstance.put(`/workers/${id}`, updates);
  return data;
}

export async function deleteWorker(id: string): Promise<void> {
  await axiosInstance.delete(`/workers/${id}`);
}

// Payroll API
export async function getPayrolls(): Promise<Payroll[]> {
  const { data } = await axiosInstance.get('/payrolls');
  return data;
}

export async function getPayroll(id: string): Promise<Payroll | undefined> {
  const { data } = await axiosInstance.get(`/payrolls/${id}`);
  return data;
}

export async function createPayroll(payroll: Omit<Payroll, 'id' | 'created_at'>): Promise<Payroll> {
  const { data } = await axiosInstance.post('/payrolls', payroll);
  return data;
}

export async function updatePayrollStatus(id: string, status: 'pending' | 'paid', paidDate?: string): Promise<Payroll> {
  const { data } = await axiosInstance.put(`/payrolls/${id}`, {
    paid_status: status,
    paid_date: paidDate
  });
  return data;
}

// Dashboard API
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axiosInstance.get('/dashboard/stats');
  return data;
}

export async function getMonthlyData(): Promise<MonthlyData[]> {
  // If no specific endpoint exists, we might need one. 
  // For now, assuming it's part of stats or a separate endpoint.
  // We'll create a placeholder request or check if backend supports it.
  try {
    const { data } = await axiosInstance.get('/dashboard/monthly-stats');
    return data;
  } catch (e) {
    console.warn("Monthly stats endpoint not implemented yet", e);
    return [];
  }
}

// Settings API
export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await axiosInstance.get('/settings');
  return data;
}

export async function updateSettings(settings: Record<string, string>): Promise<void> {
  await axiosInstance.post('/settings', { settings });
}

export async function resetData(): Promise<void> {
  await axiosInstance.post('/settings/reset');
}

export function getBackupUrl(): string {
  // Need to be careful with double slashes if baseURL ends with /
  const baseURL = axiosInstance.defaults.baseURL || '';
  const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  return `${cleanBaseURL}/settings/backup`;
}
