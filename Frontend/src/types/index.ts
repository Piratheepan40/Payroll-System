export interface Worker {
  id: string;
  full_name: string;
  address: string;
  mobile: string;
  email: string;
  nic_no: string;
  gender: 'male' | 'female' | 'other';
  job_position: string;
  department?: string;
  joined_date: string;
  basic_salary: number;
  cost_of_living_allowance: number;
  mobile_allowance: number;
  salary_type: 'monthly' | 'daily' | 'contract';
  bank_name: string;
  bank_branch: string;
  bank_account_no: string;
  status: 'active' | 'inactive' | 'resigned' | 'terminated';
  resignation_date?: string;
  last_working_date?: string;
  exit_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryCalculation {
  basic_salary: number;
  epf_employee: number; // 8%
  etf_employer: number; // 12%
  net_salary: number;
  ot_hours: number;
  ot_rate: number;
  ot_amount: number;
  incentives: number;
  other_deductions: number;
}

export interface Payroll {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_position: string;
  worker_nic: string;
  month: string;
  year: number;
  basic_salary: number;
  epf_employee: number;
  etf_employer: number;
  net_salary: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque';
  paid_date: string;
  paid_status: 'pending' | 'paid';
  present_days?: number;
  leave_days?: number;
  ot_hours?: number;
  ot_rate?: number;
  ot_amount?: number;
  incentives?: number;
  other_deductions?: number;
  created_at: string;
  worker?: Worker;
}

export interface DashboardStats {
  total_workers: number;
  active_workers: number;
  total_salary_this_month: number;
  total_epf_this_month: number;
  total_etf_this_month: number;
  total_net_salary_this_month: number;
}

export interface MonthlyData {
  month: string;
  total_salary: number;
  total_epf: number;
  total_etf: number;
  net_salary: number;
}

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
