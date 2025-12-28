'use client';

import { useState, useEffect } from 'react';
import { classAPI, subjectAPI, gradeAPI, studentAPI } from '@/lib/api';
import { FileText, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TeacherGradesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [students, setStudents] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        student_id: '',
        academic_year: '2024-2025',
        semester: '1',
        exam_type: 'test',
        exam_name: '',
        exam_date: new Date().toISOString().split('T')[0],
        score: '',
        max_score: '20',
        weight: '1',
        remarks: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            loadStudents();
            if (selectedSubject) loadGrades();
        }
    }, [selectedClass, selectedSubject]);

    const loadInitialData = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                classAPI.getAll(),
                subjectAPI.getAll()
            ]);
            setClasses(classesRes.data.data);
            setSubjects(subjectsRes.data.data);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    };

    const loadStudents = async () => {
        try {
            const res = await studentAPI.getAll({ class_id: selectedClass });
            setStudents(res.data.data);
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    };

    const loadGrades = async () => {
        setLoading(true);
        try {
            const res = await gradeAPI.getAll({
                class_id: selectedClass,
                subject_id: selectedSubject
            });
            setGrades(res.data.data);
        } catch (error) {
            console.error('Failed to load grades:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await gradeAPI.create({
                ...formData,
                subject_id: selectedSubject
            });
            Swal.fire({
                title: 'Note enregistrée',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            setShowForm(false);
            setFormData({ ...formData, student_id: '', score: '' });
            loadGrades();
        } catch (error: any) {
            Swal.fire('Erreur', error.message || 'Echec de l\'enregistrement', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Supprimer cette note ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await gradeAPI.delete(id);
                loadGrades();
            } catch (error: any) {
                Swal.fire('Erreur', error.message || 'Echec', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saisie des Notes</h1>
                    <p className="text-gray-500">Ajoutez les résultats d'évaluations pour vos élèves</p>
                </div>
                {selectedClass && selectedSubject && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Saisir une note
                    </button>
                )}
            </div>

            {/* Selectors Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Classe</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="">-- Sélectionner la classe --</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Matière</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                        <option value="">-- Sélectionner la matière --</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Entry Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 pt-full bg-blue-600"></div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Nouvelle Saisie Directe</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Élève</label>
                            <select
                                required
                                value={formData.student_id}
                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                className="w-full rounded-lg border-gray-200"
                            >
                                <option value="">-- Élève --</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>{s.user?.last_name} {s.user?.first_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Evaluation</label>
                            <input
                                type="text"
                                required
                                placeholder="ex: Devoir 1"
                                className="w-full rounded-lg border-gray-200"
                                value={formData.exam_name}
                                onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Note / {formData.max_score}</label>
                            <input
                                type="number"
                                required
                                step="0.25"
                                placeholder="00.00"
                                className="w-full rounded-lg border-gray-200 font-bold text-blue-600"
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full h-11 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700">
                                <Save className="w-4 h-4" />
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Resultats récents</h3>
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Rechercher un élève..." className="w-full pl-10 pr-4 py-2 border-gray-200 rounded-lg text-sm" />
                    </div>
                </div>

                {!selectedClass || !selectedSubject ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-blue-300" />
                        </div>
                        <p className="text-gray-400">Veuillez sélectionner les critères ci-dessus</p>
                    </div>
                ) : loading ? (
                    <div className="p-20 text-center animate-pulse">
                        <p className="text-blue-500 font-medium">Chargement des données...</p>
                    </div>
                ) : grades.length === 0 ? (
                    <div className="p-20 text-center">
                        <p className="text-gray-400 italic">Aucune note enregistrée pour le moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Élève</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Evaluation</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Note</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-gray-50 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-gray-900">{grade.student?.user?.last_name} {grade.student?.user?.first_name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">ID: {grade.student?.student_code}</div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-600 font-medium capitalize">
                                            {grade.exam_name}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className={`text-lg font-black ${Number(grade.score) >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                                {grade.score}
                                                <span className="text-[10px] text-gray-300 ml-1">/{grade.max_score}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${Number(grade.score) >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {Number(grade.score) >= 10 ? 'Admis' : 'Echec'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button onClick={() => handleDelete(grade.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
