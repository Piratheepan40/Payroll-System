import { Layout } from '@/components/layout/Layout';
import { PayrollTable } from '@/components/payroll/PayrollTable';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { generateSalarySlipPDF } from '@/lib/pdf-generator';

export default function Payroll() {
  const { payrolls, workers, processPayroll, bulkProcessPayroll } = useApp();

  const handleProcessPayroll = async (workerId: string, paymentMethod: 'cash' | 'bank_transfer' | 'cheque', presentDays?: number, leaveDays?: number, otHours?: number, incentives?: number, otherDeductions?: number) => {
    try {
      const newPayroll = await processPayroll(workerId, paymentMethod, presentDays, leaveDays, otHours, incentives, otherDeductions);
      toast.success(`Salary processed for ${newPayroll.worker_name}`);

      // Auto-generate and download receipt
      setTimeout(() => {
        generateSalarySlipPDF(newPayroll);
        toast.info('Salary receipt downloaded');
      }, 500);
    } catch (error: any) {
      console.error('Failed to process payroll:', error);

      let errorMessage = 'Failed to process payroll.';

      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        if (error.response.data && typeof error.response.data === 'object') {
          if (error.response.data.message) {
            errorMessage += ` - ${error.response.data.message}`;
          }
          if (error.response.data.errors) {
            const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
            errorMessage += ` (${validationErrors})`;
          }
        }
      } else if (error.request) {
        errorMessage = 'Network Error: No response received. Check backend connection.';
      } else {
        errorMessage = `Request Error: ${error.message}`;
      }

      toast.error(errorMessage);
    }
  };

  const handleBulkProcess = async (payrollsData: any[]) => {
    try {
      const result = await bulkProcessPayroll(payrollsData);
      toast.success(`Allocated salaries for ${result.processed_count} workers`);
      if (result.errors && result.errors.length > 0) {
        toast.warning(`Skipped ${result.errors.length} workers: ${result.errors[0]}`);
      }
    } catch (error: any) {
      console.error('Failed to bulk process:', error);
      toast.error('Failed to process bulk payroll.');
    }
  };

  return (
    <Layout title="Payroll" subtitle="Process salaries and manage payments">
      <PayrollTable
        payrolls={payrolls}
        workers={workers}
        onProcess={handleProcessPayroll}
        onBulkProcess={handleBulkProcess}
      />
    </Layout>
  );
}
