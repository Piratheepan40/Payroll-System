<?php

namespace App\Mail;

use App\Models\Payroll;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class SalaryReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public $payroll;

    /**
     * Create a new message instance.
     */
    public function __construct(Payroll $payroll)
    {
        $this->payroll = $payroll;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Salary Receipt - {$this->payroll->month} {$this->payroll->year}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.salary-receipt',
            with: [
                'payroll' => $this->payroll,
                'workerName' => $this->payroll->worker->full_name ?? $this->payroll->worker_name,
                'month' => $this->payroll->month,
                'year' => $this->payroll->year,
                'netSalary' => number_format($this->payroll->net_salary, 2),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        try {
            $pdf = Pdf::loadView('pdf.salary-receipt', ['payroll' => $this->payroll]);
            
            $fileName = str_replace(' ', '_', $this->payroll->worker->full_name ?? $this->payroll->worker_name);
            $fileName = "Salary_Receipt_{$fileName}_{$this->payroll->month}_{$this->payroll->year}.pdf";

            return [
                Attachment::fromData(fn () => $pdf->output(), $fileName)
                    ->withMime('application/pdf'),
            ];
        } catch (\Exception $e) {
            // If PDF generation fails, send email without attachment
            \Log::error("Failed to generate PDF attachment: " . $e->getMessage());
            return [];
        }
    }
}
