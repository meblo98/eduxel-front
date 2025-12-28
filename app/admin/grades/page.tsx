'use client';

import { useState, useEffect } from 'react';
import { classAPI, subjectAPI, gradeAPI, studentAPI } from '@/lib/api';
import { FileText, Plus, Search, Filter, Trash2, Edit2, Check, X, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminGradesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [students, setStudents] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingGrade, setEditingGrade] = useState<any | null>(null);

    // Form for new grade
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
        if (selectedClass && selectedSubject) {
            loadGrades();
            loadStudentsInClass();
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
            console.error('Failed to load classes/subjects:', error);
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

    const loadStudentsInClass = async () => {
        try {
            const res = await studentAPI.getAll({ class_id: selectedClass });
            setStudents(res.data.data);
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await gradeAPI.create({
                ...formData,
                subject_id: selectedSubject
            });
            Swal.fire('Succès', 'Note ajoutée avec succès', 'success');
            setShowForm(false);
            setFormData({ ...formData, student_id: '', score: '', exam_name: '', remarks: '' });
            loadGrades();
        } catch (error: any) {
            Swal.fire('Erreur', error.message || 'Echec de l\'ajout', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await gradeAPI.delete(id);
                Swal.fire('Supprimé !', 'La note a été supprimée.', 'success');
                loadGrades();
            } catch (error: any) {
                Swal.fire('Erreur', error.message || 'Echec de la suppression', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Notes</h1>
                    <p className="text-gray-500">Saisie et consultation des notes par classe et matière</p>
                </div>
                {selectedClass && selectedSubject && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Ajouter une note
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Sélectionner une classe</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Sélectionner une matière</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold mb-4">Nouvelle Saisie</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
                            <select
                                required
                                value={formData.student_id}
                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="">Sélectionner l'élève</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'examen</label>
                            <select
                                required
                                value={formData.exam_type}
                                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                                className="w-full rounded-lg border-gray-300"
                            >
                                <option value="quiz">Interrogation</option>
                                <option value="test">Devoir</option>
                                <option value="midterm">Examen partiel</option>
                                <option value="final">Examen final</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'évaluation</label>
                            <input
                                type="text"
                                required
                                placeholder="ex: Devoir n°1"
                                value={formData.exam_name}
                                onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                            <input
                                type="number"
                                step="0.25"
                                required
                                min="0"
                                max={formData.max_score}
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Note Max</label>
                            <input
                                type="number"
                                required
                                value={formData.max_score}
                                onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.exam_date}
                                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remarques</label>
                            <input
                                type="text"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="w-full rounded-lg border-gray-300"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Enregistrer</button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Grades Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : !selectedClass || !selectedSubject ? (
                    <div className="p-12 text-center text-gray-400 italic">
                        Veuillez sélectionner une classe et une matière pour voir les notes.
                    </div>
                ) : grades.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 font-medium">
                        Aucune note n'a été trouvée pour ce couple classe/matière.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Élève</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Type / Nom</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Note</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Saisie par</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{grade.student?.user?.first_name} {grade.student?.user?.last_name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="capitalize font-medium">{grade.exam_name}</span>
                                            <p className="text-xs text-gray-400 capitalize">{grade.exam_type}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <span className={`font-bold ${Number(grade.score) >= 10 ? 'text-green-600' : 'text-red-600'}`}>{grade.score}</span>
                                                <span className="text-xs text-gray-400">/ {grade.max_score}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(grade.exam_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 italic">
                                            {grade.enteredBy?.first_name} {grade.enteredBy?.last_name?.[0]}.
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleDelete(grade.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
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
