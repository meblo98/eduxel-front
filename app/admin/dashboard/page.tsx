'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI } from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface DashboardStats {
    counts: {
        students: number;
        teachers: number;
        classes: number;
    };
    finances: {
        currentMonthIncome: number;
        currentMonthExpense: number;
    };
    charts: {
        genderDistribution: Array<{ name: string; value: number; fill: string }>;
        financialHistory: Array<{ name: string; income: number; expense: number }>;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role.name !== 'admin')) {
            router.push('/login');
        } else if (user) {
            fetchStats();
        }
    }, [user, authLoading, router]);

    const fetchStats = async () => {
        try {
            const response = await dashboardAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !stats) return null;

    // Helper for currency formatting
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                            <p className="text-sm text-gray-600">{user.establishment?.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                Année: 2024-2025
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Élèves</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.counts.students}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Enseignants</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.counts.teachers}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Classes</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.counts.classes}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Revenus ce mois</p>
                                <h3 className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(stats.finances.currentMonthIncome)}</h3>
                                <p className="text-xs text-red-500 mt-1">Dépenses: {formatCurrency(stats.finances.currentMonthExpense)}</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Financial Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Aperçu Financier</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.charts.financialHistory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value as number)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" name="Revenus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Demographics Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Répartition par Genre</h3>
                        <div className="h-80 flex justify-center items-center">
                            {stats.counts.students > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.charts.genderDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.charts.genderDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <p>Pas encore d'élèves enregistrés</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => router.push('/admin/students')} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition text-left group">
                        <span className="block font-medium text-gray-900 group-hover:text-blue-600">Inscrire un élève</span>
                        <span className="text-sm text-gray-500">Ajouter un nouvel élève à une classe</span>
                    </button>
                    <button onClick={() => router.push('/admin/finance/invoices')} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition text-left group">
                        <span className="block font-medium text-gray-900 group-hover:text-blue-600">Générer une facture</span>
                        <span className="text-sm text-gray-500">Créer une facture de scolarité</span>
                    </button>
                    <button onClick={() => router.push('/admin/classes')} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition text-left group">
                        <span className="block font-medium text-gray-900 group-hover:text-blue-600">Nouvelle Classe</span>
                        <span className="text-sm text-gray-500">Créer une classe ou un niveau</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
