'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SuperAdminDashboard() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && (!user || user.role.name !== 'super_admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Super Admin</h1>
                            <p className="text-sm text-gray-600">Administration Système</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                {user.first_name} {user.last_name}
                            </span>
                            <a
                                href="/super-admin/profile"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Profil
                            </a>
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/login');
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble</h2>
                    <p className="text-gray-600">Bienvenue dans l'espace d'administration globale.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <a href="/super-admin/establishments" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer border border-transparent hover:border-blue-500">
                        <h3 className="text-lg font-medium text-gray-900">Établissements</h3>
                        <p className="mt-2 text-sm text-gray-500">Gérer les abonnements et les écoles.</p>
                        <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                            Voir la liste &rarr;
                        </span>
                    </a>
                </div>
            </main>
        </div>
    );
}
