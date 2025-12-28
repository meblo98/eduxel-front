'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function EstablishmentsList() {
    const [establishments, setEstablishments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (token) {
            fetchEstablishments();
        }
    }, [token]);

    const fetchEstablishments = async () => {
        if (!token) return;

        try {
            const res = await fetch('http://localhost:5000/api/establishments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setEstablishments(data.data);
            } else {
                Swal.fire({
                    title: 'Erreur',
                    text: data.message || 'Impossible de charger les établissements',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error fetching establishments:', error);
            Swal.fire({
                title: 'Erreur',
                text: 'Une erreur de connexion est survenue.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (loading && !establishments.length) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Établissements</h1>
                    <Link
                        href="/super-admin/establishments/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Ajouter un établissement
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {establishments.map((est) => (
                                <tr key={est.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{est.name}</div>
                                        <div className="text-sm text-gray-500">{est.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{est.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{est.city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{est.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${est.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {est.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(est.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {establishments.length === 0 && (
                        <div className="p-6 text-center text-gray-500">Aucun établissement trouvé</div>
                    )}
                </div>

                <div className="mt-4">
                    <Link href="/super-admin/dashboard" className="text-blue-600 hover:text-blue-800">
                        ← Retour au tableau de bord
                    </Link>
                </div>
            </div>
        </div>
    );
}
