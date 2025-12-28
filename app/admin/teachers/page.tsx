'use client';

import React, { useState, useEffect } from 'react';
import { User, Hash, Book, Mail, GraduationCap, Briefcase, Activity } from 'lucide-react';
import { teacherAPI, subjectAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';

interface TeacherData {
    id: number;
    teacher_code: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        status: string;
    };
    subjects: Array<{ id: number; name: string }>;
    qualification: string;
    employment_type: string;
    status: string;
}

export default function TeachersPage() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<TeacherData[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<TeacherData[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState<any | null>(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        teacher_code: '',
        qualification: '',
        employment_type: 'full_time',
        subject_ids: [] as string[]
    });

    useEffect(() => {
        fetchTeachers();
        fetchSubjects();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await teacherAPI.getAll();
            setTeachers(response.data.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter teachers based on search and filters
    useEffect(() => {
        let filtered = teachers;

        // Search filter (name, email, teacher code)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((t) =>
                `${t.user.first_name} ${t.user.last_name}`.toLowerCase().includes(query) ||
                t.user.email.toLowerCase().includes(query) ||
                t.teacher_code.toLowerCase().includes(query)
            );
        }

        // Subject filter
        if (filterSubject) {
            filtered = filtered.filter((t) =>
                t.subjects?.some((s) => s.id.toString() === filterSubject)
            );
        }

        setFilteredTeachers(filtered);
    }, [teachers, searchQuery, filterSubject]);

    const fetchSubjects = async () => {
        try {
            const response = await subjectAPI.getAll();
            setSubjects(response.data.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const columns = [
        {
            header: (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Nom de l'enseignant</span>
                </div>
            ),
            accessorKey: 'user' as keyof TeacherData,
            cell: (row: TeacherData) => `${row.user.first_name} ${row.user.last_name}`
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>Code</span>
                </div>
            ),
            accessorKey: 'teacher_code' as keyof TeacherData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    <span>Matières</span>
                </div>
            ),
            accessorKey: 'subjects' as keyof TeacherData,
            cell: (row: TeacherData) => row.subjects?.map(s => s.name).join(', ') || 'Aucune'
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                </div>
            ),
            accessorKey: 'user' as keyof TeacherData,
            cell: (row: TeacherData) => row.user.email
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Qualification</span>
                </div>
            ),
            accessorKey: 'qualification' as keyof TeacherData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Statut</span>
                </div>
            ),
            accessorKey: 'status' as keyof TeacherData,
            cell: (row: TeacherData) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentTeacher?.id) {
                await teacherAPI.update(currentTeacher.id, formData);
            } else {
                await teacherAPI.create({
                    ...formData,
                    establishment_id: user?.establishment?.id
                });
            }
            setIsModalOpen(false);
            fetchTeachers();
            resetForm();
        } catch (error) {
            console.error('Error saving teacher:', error);
            // @ts-ignore
            alert('Erreur lors de l\'enregistrement de l\'enseignant: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (teacher: TeacherData) => {
        setCurrentTeacher(teacher);
        setFormData({
            firstName: teacher.user.first_name,
            lastName: teacher.user.last_name,
            email: teacher.user.email,
            phone: teacher.user.phone || '',
            teacher_code: teacher.teacher_code,
            qualification: teacher.qualification || '',
            employment_type: teacher.employment_type || 'full_time',
            subject_ids: teacher.subjects?.map(s => s.id.toString()) || []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (teacher: TeacherData) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
            try {
                await teacherAPI.delete(teacher.id);
                fetchTeachers();
            } catch (error) {
                console.error('Error deleting teacher:', error);
                alert('Erreur lors de la suppression de l\'enseignant');
            }
        }
    };

    const handleSubjectChange = (subjectId: string) => {
        setFormData(prev => {
            const ids = prev.subject_ids.includes(subjectId)
                ? prev.subject_ids.filter(id => id !== subjectId)
                : [...prev.subject_ids, subjectId];
            return { ...prev, subject_ids: ids };
        });
    };

    const resetForm = () => {
        setCurrentTeacher(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            teacher_code: '',
            qualification: '',
            employment_type: 'full_time',
            subject_ids: []
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Enseignants</h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    + Nouvel Enseignant
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                        <Input
                            placeholder="Nom, email ou code enseignant..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
                        <select
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes les matières</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => { setSearchQuery(''); setFilterSubject(''); }}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>
                {filteredTeachers.length !== teachers.length && (
                    <p className="text-sm text-gray-600 mt-2">
                        {filteredTeachers.length} enseignant(s) sur {teachers.length}
                    </p>
                )}
            </div>

            <DataTable
                columns={columns}
                data={filteredTeachers}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
                        <h2 className="text-xl font-bold mb-4">{currentTeacher ? 'Modifier l\'enseignant' : 'Nouvel Enseignant'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Prénom"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Nom"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Téléphone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Input
                                    label="Code Enseignant"
                                    value={formData.teacher_code}
                                    onChange={(e) => setFormData({ ...formData, teacher_code: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Qualification"
                                    value={formData.qualification}
                                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Contrat</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.employment_type}
                                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                    >
                                        <option value="full_time">Temps Plein</option>
                                        <option value="part_time">Temps Partiel</option>
                                        <option value="contract">Contractuel</option>
                                        <option value="temporary">Temporaire</option>
                                    </select>
                                </div>

                                <div className="mb-4 col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Matières</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded max-h-40 overflow-y-auto">
                                        {subjects.map(subject => (
                                            <label key={subject.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.subject_ids.includes(subject.id.toString())}
                                                    onChange={() => handleSubjectChange(subject.id.toString())}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm">{subject.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit">
                                    Enregistrer
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
