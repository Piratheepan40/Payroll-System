import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Worker, Payroll, DashboardStats, MonthlyData, User } from '@/types';
import * as api from '@/lib/api';
import { calculateSalary, getCurrentMonthYear, getMonthName } from '@/lib/salary-utils';
import { toast } from 'sonner';
import { detectWorkerFraud, detectPayrollFraud } from '@/lib/fraud-detection';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  workers: Worker[];
  payrolls: Payroll[];
  stats: DashboardStats;
  monthlyData: MonthlyData[];
  loading: boolean;
  addWorker: (worker: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  processPayroll: (workerId: string, paymentMethod: 'cash' | 'bank_transfer' | 'cheque', presentDays?: number, leaveDays?: number, otHours?: number, incentives?: number, otherDeductions?: number) => Promise<Payroll>;
  bulkProcessPayroll: (payrolls: any[]) => Promise<{ processed_count: number, errors: string[] }>;
  refreshStats: () => Promise<void>;
  reloadData: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_workers: 0,
    active_workers: 0,
    total_salary_this_month: 0,
    total_epf_this_month: 0,
    total_etf_this_month: 0,
    total_net_salary_this_month: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthAndFetch();
    } else {
      setLoading(false);
    }
  }, []);

  async function checkAuthAndFetch() {
    try {
      const userData = await api.getUser();
      setUser(userData);
      await fetchData();
    } catch (error) {
      console.error("Session restore failed", error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData() {
    try {
      setLoading(true);
      const [workersData, payrollsData, statsData, monthlyStatsData] = await Promise.all([
        api.getWorkers(),
        api.getPayrolls(),
        api.getDashboardStats(),
        api.getMonthlyData()
      ]);

      setWorkers(workersData);
      setPayrolls(payrollsData);
      setStats(statsData);
      setMonthlyData(monthlyStatsData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Worker Actions
  const addWorker = async (worker: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Fraud Check
      const fraudAlert = detectWorkerFraud(worker, workers);
      if (fraudAlert.detected && fraudAlert.severity === 'high') {
        toast.error(fraudAlert.reason);
        throw new Error(fraudAlert.reason);
      }

      const newWorker = await api.createWorker(worker);
      setWorkers(prev => [...prev, newWorker]);
      await refreshStats();
    } catch (error) {
      console.error("Add worker error:", error);
      throw error;
    }
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    try {
      // Fraud Check (only if bank details changing)
      if (updates.bank_account_no || updates.nic_no) {
        const fraudAlert = detectWorkerFraud({ ...updates, id }, workers);
        if (fraudAlert.detected && fraudAlert.severity === 'high') {
          toast.error(fraudAlert.reason);
          throw new Error(fraudAlert.reason);
        }
      }

      const updated = await api.updateWorker(id, updates);
      setWorkers(prev => prev.map(w => w.id === id ? updated : w));
    } catch (error) {
      console.error("Update worker error:", error);
      throw error;
    }
  };

  const deleteWorker = async (id: string) => {
    await api.deleteWorker(id);
    setWorkers(prev => prev.filter(w => w.id !== id));
    await refreshStats();
  };

  // Payroll Actions
  const processPayroll = async (
    workerId: string,
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque',
    presentDays?: number,
    leaveDays?: number,
    otHours: number = 0,
    incentives: number = 0,
    otherDeductions: number = 0
  ) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) throw new Error('Worker not found');

    const { year, month } = getCurrentMonthYear();

    // Calculate payroll details
    const calculated = calculateSalary(worker.basic_salary, presentDays || 26, leaveDays, otHours, incentives, otherDeductions);

    const payrollData = {
      worker_id: workerId,
      worker_name: worker.full_name,
      worker_position: worker.job_position,
      worker_nic: worker.nic_no,
      month: getMonthName(month),
      year: year,
      basic_salary: worker.basic_salary,
      allowances: worker.cost_of_living_allowance + worker.mobile_allowance,
      deductions: otherDeductions,
      ot_hours: otHours,
      ot_amount: calculated.ot_amount,
      ot_rate: calculated.ot_rate,
      incentives: incentives,
      other_deductions: otherDeductions,
      net_salary: calculated.net_salary,
      paid_status: 'pending' as const,
      payment_method: paymentMethod,
      epf_employee: calculated.epf_employee,
      epf_employer: calculated.epf_employee,
      etf_employer: calculated.etf_employer,
      paid_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Fraud Check
    const fraudAlert = detectPayrollFraud(
      { ...payrollData, ot_hours: otHours },
      worker,
      payrolls
    );
    if (fraudAlert.detected) {
      toast.warning(fraudAlert.reason);
      if (fraudAlert.severity !== 'low') {
        throw new Error(fraudAlert.reason);
      }
    }

    const newPayroll = await api.createPayroll(payrollData);
    setPayrolls(prev => [...prev, newPayroll]);
    await refreshStats();
    return newPayroll;
  };

  const bulkProcessPayroll = async (payrollsData: any[]) => {
    const result = await api.createBulkPayrolls(payrollsData);
    await fetchData();
    return result;
  };

  const refreshStats = async () => {
    const newStats = await api.getDashboardStats();
    setStats(newStats);
  };

  // Auth wrappers
  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    localStorage.setItem('token', response.access_token);
    setUser(response.data);
    await fetchData();
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    const response = await api.register({ name, email, password, password_confirmation });
    localStorage.setItem('token', response.access_token);
    setUser(response.data);
    await fetchData();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    setUser(null);
    setWorkers([]);
    setPayrolls([]);
    setStats({
      total_workers: 0,
      active_workers: 0,
      total_salary_this_month: 0,
      total_epf_this_month: 0,
      total_etf_this_month: 0,
      total_net_salary_this_month: 0
    });
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      workers,
      payrolls,
      stats,
      monthlyData,
      loading,
      addWorker,
      updateWorker,
      deleteWorker,
      processPayroll,
      bulkProcessPayroll,
      refreshStats,
      reloadData: fetchData,
      login,
      register,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
