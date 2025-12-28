'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { subjectAPI, gradeAPI } from '@/lib/api';
import Swal from 'sweetalert2';

interface AddGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    onSuccess: () => void;
}

export function AddGradeModal({ isOpen, onClose, student, onSuccess }: AddGradeModalProps) {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject_id: '',
        exam_name: '',
        exam_type: 'test',
        score: '',
        max_score: '20',
        exam_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadSubjects();
        }
    }, [isOpen]);

    const loadSubjects = async () => {
        try {
            const res = await subjectAPI.getAll();
            setSubjects(res.data.data || []);
        } catch (error) {
            console.error('Failed to load subjects:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await gradeAPI.create({
                ...formData,
                student_id: student.id
            });
            Swal.fire({
                title: 'Note ajoutée',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            Swal.fire('Erreur', error.message || 'Echec de l\'ajout', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Ajouter une note</h3>
                        <p className="text-sm text-gray-500">{student.user?.first_name} {student.user?.last_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Matière</label>
                        <select
                            required
                            value={formData.subject_id}
                            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                            className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Sélectionner --</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                            <select
                                value={formData.exam_type}
                                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                                className="w-full rounded-lg border-gray-200"
                            >
                                <option value="quiz">Interro</option>
                                <option value="test">Devoir</option>
                                <option value="midterm">Partiel</option>
                                <option value="final">Final</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom</label>
                            <input
                                type="text"
                                required
                                placeholder="ex: Devoir 1"
                                value={formData.exam_name}
                                onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                                className="w-full rounded-lg border-gray-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Note / {formData.max_score}</label>
                            <input
                                type="number"
                                step="0.25"
                                required
                                min="0"
                                max={formData.max_score}
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                className="w-full rounded-lg border-gray-200 font-bold text-blue-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.exam_date}
                                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                                className="w-full rounded-lg border-gray-200 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Remarques</label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="w-full rounded-lg border-gray-200 h-20 resize-none text-sm"
                            placeholder="Optionnel..."
                        ></textarea>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white h-11 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Enregistrement...' : 'Enregistrer la note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
