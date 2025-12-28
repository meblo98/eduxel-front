'use client';

import React, { useState, useEffect } from 'react';
import { FileText, User, DollarSign, Activity, CreditCard } from 'lucide-react';
import { financeAPI, studentAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable';

interface InvoiceData {
    id: number;
    invoice_number: string;
    student: {
        student_code: string;
        user: {
            first_name: string;
            last_name: string;
        }
    };
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    due_date: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

    // Invoice Form State
    const [formData, setFormData] = useState({
        student_id: '',
        description: '',
        due_date: '',
        amount: 0
    });

    // Payment Form State
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        payment_method: 'cash',
        reference_number: '',
        notes: ''
    });

    useEffect(() => {
        fetchInvoices();
        fetchStudents();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await financeAPI.getInvoices();
            setInvoices(response.data.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await studentAPI.getAll();
            setStudents(response.data.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await financeAPI.createInvoice({
                student_id: formData.student_id,
                due_date: formData.due_date,
                description: formData.description,
                // Creating a single item for simplicity now
                items: [{
                    description: 'Tuition Fee',
                    quantity: 1,
                    unit_price: formData.amount
                }]
            });
            setIsModalOpen(false);
            fetchInvoices();
            setFormData({ student_id: '', description: '', due_date: '', amount: 0 });
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice');
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        try {
            await financeAPI.recordPayment({
                invoice_id: selectedInvoice.id,
                ...paymentData
            });
            setIsPaymentModalOpen(false);
            fetchInvoices();
            setPaymentData({ amount: 0, payment_method: 'cash', reference_number: '', notes: '' });
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment');
        }
    };

    const columns = [
        {
            header: (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Invoice #</span>
                </div>
            ),
            accessorKey: 'invoice_number' as keyof InvoiceData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Student</span>
                </div>
            ),
            accessorKey: 'student' as keyof InvoiceData,
            cell: (row: InvoiceData) => `${row.student?.user?.first_name ?? row.student?.student_code ?? '-'} ${row.student?.user?.last_name ?? ''}`.trim()
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Total</span>
                </div>
            ),
            accessorKey: 'total_amount' as keyof InvoiceData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Paid</span>
                </div>
            ),
            accessorKey: 'amount_paid' as keyof InvoiceData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Balance</span>
                </div>
            ),
            accessorKey: 'balance' as keyof InvoiceData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Status</span>
                </div>
            ),
            accessorKey: 'status' as keyof InvoiceData,
            cell: (row: InvoiceData) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'paid' ? 'bg-green-100 text-green-800' :
                    row.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessorKey: 'id' as keyof InvoiceData,
            cell: (row: InvoiceData) => (
                row.status !== 'paid' && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setSelectedInvoice(row); setIsPaymentModalOpen(true); }}
                        title="Payer"
                    >
                        <CreditCard className="h-4 w-4" />
                    </Button>
                )
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ New Invoice</Button>
            </div>

            <DataTable columns={columns} data={invoices} isLoading={loading} />

            {/* New Invoice Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create Invoice</h2>
                        <form onSubmit={handleCreateInvoice}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.student_id}
                                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.user.first_name} {s.user.last_name} ({s.student_code})</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                required
                            />
                            <Input
                                label="Due Date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                required
                            />
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Record Payment for {selectedInvoice.invoice_number}</h2>
                        <div className="mb-4 text-sm text-gray-600">
                            Balance Due: {selectedInvoice.balance}
                        </div>
                        <form onSubmit={handleRecordPayment}>
                            <Input
                                label="Amount"
                                type="number"
                                max={selectedInvoice.balance}
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                                required
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={paymentData.payment_method}
                                    onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="card">Card</option>
                                    <option value="mobile_money">Mobile Money</option>
                                </select>
                            </div>
                            <Input
                                label="Reference / Notes"
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                            />
                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Record Payment</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
