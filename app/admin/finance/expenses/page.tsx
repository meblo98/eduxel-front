'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Tag, FileText, DollarSign, User, Activity } from 'lucide-react';
import { financeAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable';

interface ExpenseData {
    id: number;
    category: string;
    description: string;
    amount: number;
    expense_date: string;
    createdBy: {
        first_name: string;
        last_name: string;
    };
    status: string;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        category: 'supplies',
        description: '',
        amount: 0,
        expense_date: '',
        payment_method: 'cash',
        vendor: '',
        notes: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await financeAPI.getExpenses();
            setExpenses(response.data.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await financeAPI.createExpense(formData);
            setIsModalOpen(false);
            fetchExpenses();
            resetForm();
        } catch (error) {
            console.error('Error creating expense:', error);
            alert('Failed to create expense');
        }
    };

    const resetForm = () => {
        setFormData({
            category: 'supplies',
            description: '',
            amount: 0,
            expense_date: '',
            payment_method: 'cash',
            vendor: '',
            notes: ''
        });
    };

    const columns = [
        {
            header: (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date</span>
                </div>
            ),
            accessorKey: 'expense_date' as keyof ExpenseData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Category</span>
                </div>
            ),
            accessorKey: 'category' as keyof ExpenseData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Description</span>
                </div>
            ),
            accessorKey: 'description' as keyof ExpenseData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Amount</span>
                </div>
            ),
            accessorKey: 'amount' as keyof ExpenseData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Created By</span>
                </div>
            ),
            accessorKey: 'createdBy' as keyof ExpenseData,
            cell: (row: ExpenseData) => `${row.createdBy?.first_name} ${row.createdBy?.last_name}`
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Status</span>
                </div>
            ),
            accessorKey: 'status' as keyof ExpenseData,
            cell: (row: ExpenseData) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Record Expense</Button>
            </div>

            <DataTable columns={columns} data={expenses} isLoading={loading} />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Record New Expense</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="supplies">Supplies</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="salary">Salary</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                            <Input
                                label="Amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                required
                            />
                            <Input
                                label="Date"
                                type="date"
                                value={formData.expense_date}
                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                            />

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
