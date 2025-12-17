import { useState } from 'react';
import { Worker } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/salary-utils';
import { Search, MoreVertical, Eye, Pencil, Trash2, UserPlus, Download } from 'lucide-react';
import { exportWorkersToExcel } from '@/lib/excel-generator';

interface WorkersTableProps {
  workers: Worker[];
  onView: (worker: Worker) => void;
  onEdit: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
  onAdd: () => void;
}

export function WorkersTable({ workers, onView, onEdit, onDelete, onAdd }: WorkersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.job_position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.nic_no.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-72"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => exportWorkersToExcel(workers)} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Worker</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>NIC</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No workers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkers.map((worker) => (
                  <TableRow key={worker.id} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {worker.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{worker.full_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{worker.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{worker.job_position}</TableCell>
                    <TableCell className="font-mono text-sm">{worker.nic_no}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(worker.basic_salary)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={worker.status === 'active' ? 'default' : 'secondary'}
                        className={worker.status === 'active' ? 'bg-success text-success-foreground' : ''}
                      >
                        {worker.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(worker)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(worker)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(worker)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-muted-foreground">
        <p>
          Showing {filteredWorkers.length} of {workers.length} workers
        </p>
        <p>
          Total Basic Salary: {formatCurrency(filteredWorkers.reduce((sum, w) => sum + w.basic_salary, 0))}
        </p>
      </div>
    </div>
  );
}
