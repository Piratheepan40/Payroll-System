import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, calculateSalary } from '@/lib/salary-utils';
import {
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Building2,
    Calendar,
    Briefcase,
    ArrowLeft,
    FileText,
    Download
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { generateSalarySlipPDF } from '@/lib/pdf-generator';

export default function WorkerPortfolio() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { workers, payrolls } = useApp();

    const worker = workers.find(w => String(w.id) === String(id));

    // Get payroll history for this worker
    const workerPayrolls = payrolls
        .filter(p => String(p.worker_id) === String(id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (!worker) {
        return (
            <Layout title="Worker Not Found" subtitle="The requested worker profile could not be found.">
                <div className="flex flex-col items-center justify-center py-12">
                    <h2 className="text-2xl font-bold text-gray-500 mb-4">Worker not found</h2>
                    <Button onClick={() => navigate('/workers')}>Back to Workers</Button>
                </div>
            </Layout>
        );
    }

    const salaryBreakdown = calculateSalary(worker.basic_salary);

    return (
        <Layout title="Worker Portfolio" subtitle="Detailed profile and history">
            <div className="space-y-6">
                {/* Navigation & Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/workers')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>

                {/* Profile Header Image/Card */}
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground text-4xl font-bold shadow-lg">
                                    {worker.full_name.charAt(0)}
                                </div>
                            </div>
                            <div className="flex-grow text-center md:text-left space-y-2">
                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                    <h1 className="text-3xl font-bold text-foreground">{worker.full_name}</h1>
                                    <Badge className={worker.status === 'active' ? 'bg-success hover:bg-success/90' : ''}>
                                        {worker.status}
                                    </Badge>
                                </div>
                                <p className="text-xl text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    {worker.job_position}
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {worker.email}</span>
                                    <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {worker.mobile}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {worker.address}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Personal & Bank Details */}
                    <div className="space-y-6 md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5 text-primary" />
                                    Personal Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">NIC No</span>
                                    <span className="font-mono font-medium">{worker.nic_no}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Gender</span>
                                    <span className="capitalize font-medium">{worker.gender}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Joined Date</span>
                                    <span className="font-medium">{formatDate(worker.joined_date)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Banking Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Bank Name</span>
                                    <span className="font-medium">{worker.bank_name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Account No</span>
                                    <span className="font-mono font-medium">{worker.bank_account_no}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Current Salary Structure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                                    <span className="text-muted-foreground">Basic Salary</span>
                                    <span className="font-bold text-lg">{formatCurrency(worker.basic_salary)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-red-50 p-2 rounded text-red-700">
                                        <span className="block text-xs">EPF (8%)</span>
                                        <span className="font-bold">-{formatCurrency(salaryBreakdown.epf_employee)}</span>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded text-green-700">
                                        <span className="block text-xs">ETF (12%)</span>
                                        <span className="font-bold">{formatCurrency(salaryBreakdown.etf_employer)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Payroll History */}
                    <div className="md:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Payroll History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {workerPayrolls.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No payroll history found for this worker.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Month/Year</TableHead>
                                                <TableHead>Basic</TableHead>
                                                <TableHead>Net Pay</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workerPayrolls.map((payroll) => (
                                                <TableRow key={payroll.id}>
                                                    <TableCell className="font-medium">
                                                        {payroll.month} {payroll.year}
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                                                    <TableCell className="font-bold text-primary">
                                                        {formatCurrency(payroll.net_salary)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={payroll.paid_status === 'paid' ? 'default' : 'secondary'}>
                                                            {payroll.paid_status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => generateSalarySlipPDF(payroll)}
                                                        >
                                                            <Download className="h-4 w-4 mr-1" />
                                                            Payslip
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
