'use client';

import { useState, useEffect } from 'react';
import { parentAPI } from '@/lib/api';
import { User, GraduationCap, School, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ParentDashboard() {
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChildren();
    }, []);

    const loadChildren = async () => {
        try {
            const res = await parentAPI.getChildren();
            setChildren(res.data.data || []);
        } catch (err) {
            console.error('Failed to load children', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Enfants</h1>

            {children.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun enfant associé</h3>
                    <p className="text-gray-500">Aucun élève n'est associé à votre compte pour le moment.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {children.map((child) => (
                        <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                            {child.user?.first_name?.[0]}{child.user?.last_name?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{child.user?.first_name} {child.user?.last_name}</h3>
                                            <p className="text-sm text-gray-500">{child.student_code}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {child.status === 'active' ? 'Actif' : child.status}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <GraduationCap className="w-4 h-4 text-gray-400" />
                                        <span>{child.class?.name || 'Sans classe'} ({child.class?.level?.name || '-'})</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <School className="w-4 h-4 text-gray-400" />
                                        <span>{child.establishment?.name}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-2">
                                    <Link
                                        href={`/parent/children/${child.id}/grades`}
                                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Notes
                                    </Link>
                                    <Link
                                        href={`/parent/children/${child.id}/timetable`}
                                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Emploi du temps
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
