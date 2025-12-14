import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Worker, Payroll, DashboardStats, MonthlyData, User } from '@/types';
import * as api from '@/lib/api';
import { calculateSalary, getCurrentMonthYear, getMonthName } from '@/lib/salary-utils';

interface AppContextType {
  user: User | null;
  workers: Worker[];
  payrolls: Payroll[];
  stats: DashboardStats;
  monthlyData: MonthlyData[];
  loading: boolean;
  addWorker: (worker: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  processPayroll: (workerId: string, paymentMethod: 'cash' | 'bank_transfer' | 'cheque', presentDays?: number, leaveDays?: number) => Promise<Payroll>;
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
    total_net_salary_this_month: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial user check
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getUser();
          setUser(userData);
          await fetchData();
        } catch (error) {
          console.error("Failed to restore session", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    try {
      // Don't set global loading to true here to avoid full screen flicker on refresh if possible,
      // or handle it gracefully. For now, we assume user is authenticated so we fetch.
      const [workersData, payrollsData, statsData, monthlyStatsData] = await Promise.all([
        api.getWorkers(),
        api.getPayrolls(),
        api.getDashboardStats(),
        api.getMonthlyData(),
      ]);

      setWorkers(workersData);
      setPayrolls(payrollsData);
      setStats(statsData);
      setMonthlyData(monthlyStatsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

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
      console.error("Logout failed on server", e);
    }
    localStorage.removeItem('token');
    setUser(null);
    setWorkers([]);
    setPayrolls([]);
  };

  const refreshStats = async () => {
    try {
      const statsData = await api.getDashboardStats();
      setStats(statsData);
      const monthly = await api.getMonthlyData();
      setMonthlyData(monthly);
    } catch (e) {
      console.error("Failed to refresh stats", e);
    }
  };

  const addWorker = async (workerData: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newWorker = await api.createWorker(workerData);
      setWorkers(prev => [...prev, newWorker]);
      await refreshStats();
    } catch (error) {
      console.error("Failed to add worker", error);
      throw error;
    }
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    try {
      const updatedWorker = await api.updateWorker(id, updates);
      setWorkers(prev => prev.map(w => w.id === id ? updatedWorker : w));
      await refreshStats();
    } catch (error) {
      console.error("Failed to update worker", error);
      throw error;
    }
  };

  const deleteWorker = async (id: string) => {
    try {
      await api.deleteWorker(id);
      setWorkers(prev => prev.filter(w => w.id !== id));
      await refreshStats();
    } catch (error) {
      console.error("Failed to delete worker", error);
      throw error;
    }
  };

  const processPayroll = async (
    workerId: string,
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque',
    presentDays?: number,
    leaveDays?: number
  ): Promise<Payroll> => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) throw new Error('Worker not found');

    const { month, year } = getCurrentMonthYear();

    // Calculate salary based on attendance if provided, otherwise defaults to full salary
    const calc = calculateSalary(worker.basic_salary, presentDays, leaveDays);

    const payrollData = {
      worker_id: worker.id,
      worker_name: worker.full_name,
      worker_position: worker.job_position,
      worker_nic: worker.nic_no,
      month: getMonthName(month),
      year,
      basic_salary: calc.basic_salary, // This is now the prorated amount
      epf_employee: calc.epf_employee,
      etf_employer: calc.etf_employer,
      net_salary: calc.net_salary,
      payment_method: paymentMethod,
      paid_date: new Date().toISOString().split('T')[0],
      paid_status: 'paid' as 'paid',
      present_days: presentDays,
      leave_days: leaveDays,
    };

    try {
      const newPayroll = await api.createPayroll(payrollData);
      setPayrolls(prev => [...prev, newPayroll]);
      await refreshStats();
      return newPayroll;
    } catch (error) {
      console.error("Failed to process payroll", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      workers,
      payrolls,
      stats,
      monthlyData,
      loading,
      addWorker,
      updateWorker,
      deleteWorker,
      processPayroll,
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
