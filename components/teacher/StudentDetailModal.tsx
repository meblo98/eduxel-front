'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, BookOpen, GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import { studentAPI, gradeAPI, attendanceAPI } from '@/lib/api';

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: number;
}

export function StudentDetailModal({ isOpen, onClose, studentId }: StudentDetailModalProps) {
    const [student, setStudent] = useState<any>(null);
    const [grades, setGrades] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'grades' | 'attendance'>('info');

    useEffect(() => {
        if (isOpen && studentId) {
            loadStudentData();
        }
    }, [isOpen, studentId]);

    const loadStudentData = async () => {
        setLoading(true);
        try {
            const [sRes, gRes, aRes] = await Promise.all([
                studentAPI.getOne(studentId),
                gradeAPI.getAll({ student_id: studentId }),
                attendanceAPI.getByStudent(studentId)
            ]);
            setStudent(sRes.data.data);
            setGrades(gRes.data.data || []);
            setAttendance(aRes.data.data || []);
        } catch (error) {
            console.error('Failed to load student data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl backdrop-blur-md">
                            {student?.user?.first_name?.[0]}{student?.user?.last_name?.[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{student?.user?.first_name} {student?.user?.last_name}</h2>
                            <p className="text-blue-100 text-sm opacity-80">Matricule: {student?.student_code}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-8 border-b flex gap-8 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Informations
                    </button>
                    <button
                        onClick={() => setActiveTab('grades')}
                        className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'grades' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Historique des Notes
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Assiduité
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Récupération des données...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Détails Personnels</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                                                    <p className="font-medium">{student?.user?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Téléphone</p>
                                                    <p className="font-medium">{student?.user?.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date de naissance</p>
                                                    <p className="font-medium">{student?.user?.date_of_birth ? new Date(student.user.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-900 border-l-4 border-indigo-600 pl-3">Académie</h3>
                                        <div className="grid grid-cols-1 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                            <div className="flex items-center gap-3">
                                                <GraduationCap className="w-5 h-5 text-indigo-500" />
                                                <span className="font-medium text-gray-700">Classe: {student?.class?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <BookOpen className="w-5 h-5 text-indigo-500" />
                                                <span className="font-medium text-gray-700">Moyenne: {(grades.reduce((a, b) => a + Number(b.score), 0) / (grades.length || 1)).toFixed(2)} / 20</span>
                                            </div>
                                        </div>
                                        {student?.parent && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Parent / Tuteur</p>
                                                <div className="bg-white border rounded-lg p-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold">{student.parent.first_name} {student.parent.last_name}</p>
                                                        <p className="text-xs text-gray-500">{student.parent.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'grades' && (
                                <div className="space-y-4">
                                    {grades.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">Aucune note enregistrée</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden border border-gray-100 rounded-xl">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Matière</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Evaluation</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase">Note</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase text-right">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {grades.map((grade) => (
                                                        <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-sm text-gray-900">{grade.subject?.name}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{grade.exam_name}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`font-bold ${Number(grade.score) >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                                                                    {grade.score}
                                                                </span>
                                                                <span className="text-[10px] text-gray-300 ml-1">/{grade.max_score}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-xs text-gray-500">
                                                                {new Date(grade.exam_date).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div className="space-y-4">
                                    {attendance.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">Aucun historique d'assiduité</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {attendance.map((record) => (
                                                <div key={record.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">Saisi par: {record.markedBy?.first_name}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                            record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {record.status === 'present' ? 'Présent' : record.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
