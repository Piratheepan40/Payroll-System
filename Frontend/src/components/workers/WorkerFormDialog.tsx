import { useEffect, useState } from 'react';
import { Worker } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface WorkerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (worker: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => void;
  worker?: Worker;
  mode: 'add' | 'edit';
}

export function WorkerFormDialog({
  open,
  onClose,
  onSubmit,
  worker,
  mode,
}: WorkerFormDialogProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    mobile: '',
    email: '',
    nic_no: '',
    gender: 'male' as 'male' | 'female' | 'other',
    job_position: '',
    joined_date: new Date().toISOString().split('T')[0],
    basic_salary: 0,
    cost_of_living_allowance: 0,
    mobile_allowance: 0,
    bank_name: '',
    bank_account_no: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Update form data when worker prop changes or dialog opens
  useEffect(() => {
    if (open) {
      if (worker && mode === 'edit') {
        setFormData({
          full_name: worker.full_name || '',
          address: worker.address || '',
          mobile: worker.mobile || '',
          email: worker.email || '',
          nic_no: worker.nic_no || '',
          gender: worker.gender || 'male',
          job_position: worker.job_position || '',
          joined_date: worker.joined_date || new Date().toISOString().split('T')[0],
          basic_salary: worker.basic_salary || 0,
          cost_of_living_allowance: worker.cost_of_living_allowance || 0,
          mobile_allowance: worker.mobile_allowance || 0,
          salary_type: worker.salary_type || 'monthly',
          bank_name: worker.bank_name || '',
          bank_branch: worker.bank_branch || '',
          bank_account_no: worker.bank_account_no || '',
          status: worker.status || 'active',
        });
      } else {
        // Reset form for add mode
        setFormData({
          full_name: '',
          address: '',
          mobile: '',
          email: '',
          nic_no: '',
          gender: 'male',
          job_position: '',
          joined_date: new Date().toISOString().split('T')[0],
          basic_salary: 0,
          cost_of_living_allowance: 0,
          mobile_allowance: 0,
          salary_type: 'monthly',
          bank_name: '',
          bank_branch: '',
          bank_account_no: '',
          status: 'active',
        });
      }
    }
  }, [open, worker, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'add' ? 'Add New Worker' : 'Edit Worker'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Enter the details of the new worker below. All fields marked with * are required.'
              : 'Update the worker information below. Click save when you are done.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nic_no">NIC Number *</Label>
              <Input
                id="nic_no"
                value={formData.nic_no}
                onChange={(e) => setFormData({ ...formData, nic_no: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_position">Job Position *</Label>
              <Input
                id="job_position"
                value={formData.job_position}
                onChange={(e) => setFormData({ ...formData, job_position: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joined_date">Joined Date *</Label>
              <Input
                id="joined_date"
                type="date"
                value={formData.joined_date}
                onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic_salary">Basic Salary (LKR) *</Label>
              <Input
                id="basic_salary"
                type="number"
                value={formData.basic_salary}
                onChange={(e) => setFormData({ ...formData, basic_salary: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_type">Salary Type</Label>
              <Select
                value={formData.salary_type}
                onValueChange={(value) => setFormData({ ...formData, salary_type: value as 'monthly' | 'daily' | 'contract' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_branch">Branch</Label>
              <Input
                id="bank_branch"
                value={formData.bank_branch}
                onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_no">Bank Account Number *</Label>
              <Input
                id="bank_account_no"
                value={formData.bank_account_no}
                onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Worker' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
