'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { parentAPI } from '@/lib/api';
import { FileText, Calendar, ArrowLeft, Trophy, Target, Info } from 'lucide-react';
import Link from 'next/link';

export default function ChildGradesPage() {
    const { id } = useParams();
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadChildrenGrades();
    }, [id]);

    const loadChildrenGrades = async () => {
        try {
            const res = await parentAPI.getChildGrades(Number(id));
            setGrades(res.data.data || []);
        } catch (err) {
            console.error('Failed to load grades', err);
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
            <div className="flex items-center gap-4 mb-6">
                <Link href="/parent/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Notes de l'élève</h1>
            </div>

            {grades.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune note disponible</h3>
                    <p className="text-gray-500">Les notes de votre enfant n'ont pas encore été enregistrées.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Summary stats could be calculated here */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Moyenne Générale</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(grades.reduce((acc, g) => acc + Number(g.score), 0) / grades.length).toFixed(2)} / 20
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Evaluations</p>
                                <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Matière</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Type d'examen</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Note</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Commentaires</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {grades.map((grade) => (
                                        <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">{grade.subject?.name}</span>
                                                <p className="text-xs text-gray-500">{grade.subject?.code}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize text-sm text-gray-600">{grade.exam_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-bold ${Number(grade.score) >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {grade.score}
                                                    </span>
                                                    <span className="text-sm text-gray-400">/ {grade.max_score}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(grade.exam_date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    {grade.remarks ? (
                                                        <span title={grade.remarks}>{grade.remarks}</span>
                                                    ) : (
                                                        <span className="italic text-gray-400">Aucun</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
