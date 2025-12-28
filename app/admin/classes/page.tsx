'use client';

import React, { useState, useEffect } from 'react';
import { Users, Hash, Layers, Calendar, Activity, Eye } from 'lucide-react';
import { classAPI, levelAPI, timetableAPI, teacherAPI, subjectAPI, studentAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { TimetableGrid } from '@/components/TimetableGrid';

interface ClassData {
    id: number;
    name: string;
    code: string;
    level: { id: number; name: string };
    capacity: number;
    studentCount: number;
    academic_year: string;
    status: string;
}

export default function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [levels, setLevels] = useState<any[]>([]); // New state for levels
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false); // Modal to add level
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
    const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);
    const [classStudents, setClassStudents] = useState<any[]>([]);
    const [classStudentsLoading, setClassStudentsLoading] = useState(false);
    const [isClassViewOpen, setIsClassViewOpen] = useState(false);
    const [classDetails, setClassDetails] = useState<any | null>(null);
    const [currentClass, setCurrentClass] = useState<Partial<ClassData> | null>(null);

    // Class Form states
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        level_id: '',
        capacity: 30,
        academic_year: '2024-2025',
        room: ''
    });

    // Timetable form
    const [timetableForm, setTimetableForm] = useState({
        day_of_week: 'monday',
        start_time: '08:00',
        end_time: '09:00',
        teacher_id: '',
        subject_id: '',
        room: '',
        academic_year: '2024-2025'
    });

    // Level Form State
    const [levelFormData, setLevelFormData] = useState({
        name: '',
        code: '',
        order: 1
    });

    useEffect(() => {
        fetchClasses();
        fetchLevels();
        fetchTeachers();
        fetchSubjects();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await classAPI.getAll();
            setClasses(response.data.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLevels = async () => {
        try {
            const response = await levelAPI.getAll();
            setLevels(response.data.data);
        } catch (error) {
            console.error("Error fetching levels", error);
        }
    }

    const fetchTeachers = async () => {
        try {
            const res = await teacherAPI.getAll();
            setTeachers(res.data.data || []);
        } catch (err) {
            console.error('Error fetching teachers', err);
        }
    }

    const fetchSubjects = async () => {
        try {
            const res = await subjectAPI.getAll();
            setSubjects(res.data.data || []);
        } catch (err) {
            console.error('Error fetching subjects', err);
        }
    }

    const columns = [
        {
            header: (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Nom de la classe</span>
                </div>
            ),
            accessorKey: 'name' as keyof ClassData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>Code</span>
                </div>
            ),
            accessorKey: 'code' as keyof ClassData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>Niveau</span>
                </div>
            ),
            accessorKey: (row: ClassData) => row.level?.name || 'N/A'
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Élèves</span>
                </div>
            ),
            accessorKey: 'studentCount' as keyof ClassData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Capacité</span>
                </div>
            ),
            accessorKey: 'capacity' as keyof ClassData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Année</span>
                </div>
            ),
            accessorKey: 'academic_year' as keyof ClassData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Statut</span>
                </div>
            ),
            accessorKey: 'status' as keyof ClassData,
            cell: (row: ClassData) => (
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
            // Validation: Ensure level_id is present
            if (!formData.level_id) {
                alert('Veuillez sélectionner un niveau');
                return;
            }

            if (currentClass?.id) {
                await classAPI.update(currentClass.id, formData);
            } else {
                await classAPI.create({
                    ...formData,
                    establishment_id: user?.establishment?.id
                });
            }
            setIsModalOpen(false);
            fetchClasses();
            resetForm();
        } catch (error) {
            console.error('Error saving class:', error);
            alert('Erreur lors de l\'enregistrement de la classe');
        }
    };

    const handleCreateLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await levelAPI.create(levelFormData);
            setIsLevelModalOpen(false);
            fetchLevels();
            setLevelFormData({ name: '', code: '', order: levels.length + 1 });
        } catch (error) {
            console.error('Error creating level:', error);
            alert('Erreur lors de la création du niveau');
        }
    };

    const handleEdit = (classData: ClassData) => {
        setCurrentClass(classData);
        setFormData({
            name: classData.name,
            code: classData.code,
            level_id: classData.level?.id?.toString() || '',
            capacity: classData.capacity,
            academic_year: classData.academic_year,
            room: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (classData: ClassData) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
            try {
                await classAPI.delete(classData.id);
                fetchClasses();
            } catch (error) {
                console.error('Error deleting class:', error);
                alert('Erreur lors de la suppression de la classe');
            }
        }
    };

    // Timetable actions
    const openTimetable = async (classData: ClassData) => {
        setCurrentClass(classData);
        setIsTimetableModalOpen(true);
        await loadTimetableEntries(classData.id);
    };

    const openClassDetail = async (classData: ClassData) => {
        setCurrentClass(classData);
        setIsClassDetailOpen(true);
        await loadClassStudents(classData.id);
    };

    const openClassView = async (classData: ClassData) => {
        try {
            setCurrentClass(classData);
            // Fetch fresh details
            const res = await classAPI.getOne(classData.id);
            setClassDetails(res.data.data || classData);
            setIsClassViewOpen(true);
        } catch (err) {
            console.error('Error fetching class details', err);
            setClassDetails(classData);
            setIsClassViewOpen(true);
        }
    };

    const loadClassStudents = async (classId: number) => {
        try {
            setClassStudentsLoading(true);
            const res = await studentAPI.getAll({ class_id: classId });
            setClassStudents(res.data.data || []);
        } catch (err) {
            console.error('Error loading class students', err);
            setClassStudents([]);
        } finally {
            setClassStudentsLoading(false);
        }
    };

    const loadTimetableEntries = async (classId: number) => {
        try {
            const res = await timetableAPI.getAll({ class_id: classId });
            setTimetableEntries(res.data.data || []);
        } catch (err) {
            console.error('Error loading timetable entries', err);
            setTimetableEntries([]);
        }
    };

    const classStudentColumns = [
        {
            header: 'Nom',
            accessorKey: (row: any) => `${row.user?.first_name || ''} ${row.user?.last_name || ''}`
        },
        {
            header: 'Email',
            accessorKey: (row: any) => row.user?.email || ''
        },
        {
            header: 'Code',
            accessorKey: (row: any) => row.student_code || ''
        },
        {
            header: 'Statut',
            accessorKey: (row: any) => row.status || ''
        }
    ];

    const handleAddTimetableEntry = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!currentClass?.id) return;

        try {
            // Basic validation
            if (!timetableForm.teacher_id || !timetableForm.subject_id) {
                alert('Veuillez sélectionner un professeur et une matière');
                return;
            }

            const payload = {
                class_id: currentClass.id,
                teacher_id: timetableForm.teacher_id,
                subject_id: timetableForm.subject_id,
                day_of_week: timetableForm.day_of_week,
                start_time: timetableForm.start_time,
                end_time: timetableForm.end_time,
                room: timetableForm.room,
                academic_year: timetableForm.academic_year
            };

            await timetableAPI.create(payload);
            await loadTimetableEntries(currentClass.id);
            // reset form times
            setTimetableForm({ ...timetableForm, start_time: '08:00', end_time: '09:00', room: '' });
        } catch (err: any) {
            console.error('Error adding timetable entry', err);
            alert(err?.response?.data?.message || 'Erreur lors de l\'ajout de l\'emploi du temps');
        }
    };

    const handleDeleteTimetableEntry = async (id: number) => {
        if (!confirm('Supprimer cette séance ?')) return;
        try {
            await timetableAPI.delete(id);
            if (currentClass?.id) await loadTimetableEntries(currentClass.id);
        } catch (err) {
            console.error('Error deleting timetable entry', err);
            alert('Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setCurrentClass(null);
        setFormData({
            name: '',
            code: '',
            level_id: '',
            capacity: 30,
            academic_year: '2024-2025',
            room: ''
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Classes</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsLevelModalOpen(true)}>
                        Gérer les Niveaux
                    </Button>
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        + Nouvelle Classe
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={classes}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                extraActions={[
                    {
                        icon: <Eye className="h-4 w-4" />,
                        title: 'Voir',
                        onClick: (row: any) => openClassView(row)
                    }
                ]}
            />

            {/* Class Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{currentClass ? 'Modifier la Classe' : 'Nouvelle Classe'}</h2>
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Nom de la classe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="ex: 6eme A"
                            />
                            <Input
                                label="Code de la classe"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                                placeholder="ex: 6A"
                            />

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                                {levels.length === 0 ? (
                                    <div className="text-sm text-red-500">
                                        Aucun niveau trouvé. <button type="button" onClick={() => { setIsModalOpen(false); setIsLevelModalOpen(true) }} className="underline">Créer un niveau d'abord</button>.
                                    </div>
                                ) : (
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.level_id}
                                        onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Sélectionner un niveau</option>
                                        {levels.map((level) => (
                                            <option key={level.id} value={level.id}>
                                                {level.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Année Académique</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.academic_year}
                                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                                >
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2025-2026">2025-2026</option>
                                </select>
                            </div>
                            <Input
                                label="Capacité"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                required
                            />

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={levels.length === 0}>
                                    Enregistrer
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Level Modal */}
            {isLevelModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Ajouter un Niveau</h2>
                        <form onSubmit={handleCreateLevel}>
                            <Input
                                label="Nom du niveau"
                                value={levelFormData.name}
                                onChange={(e) => setLevelFormData({ ...levelFormData, name: e.target.value })}
                                required
                                placeholder="ex: 6eme"
                            />
                            <Input
                                label="Code du niveau"
                                value={levelFormData.code}
                                onChange={(e) => setLevelFormData({ ...levelFormData, code: e.target.value })}
                                required
                                placeholder="ex: 6EME"
                            />
                            <Input
                                label="Ordre"
                                type="number"
                                value={levelFormData.order}
                                onChange={(e) => setLevelFormData({ ...levelFormData, order: parseInt(e.target.value) })}
                                required
                            />

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setIsLevelModalOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit">
                                    Créer
                                </Button>
                            </div>
                        </form>
                        <div className="mt-4 border-t pt-4">
                            <h3 className="font-semibold text-sm mb-2">Niveaux Existants</h3>
                            <div className="max-h-40 overflow-y-auto">
                                {levels.map(l => (
                                    <div key={l.id} className="flex justify-between text-sm py-1 border-b">
                                        <span>{l.name} ({l.code})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Timetable Modal */}
            {isTimetableModalOpen && currentClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-6xl mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Emploi du temps — {currentClass.name}</h2>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setIsTimetableModalOpen(false)}>Fermer</Button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <form className="grid grid-cols-2 gap-4 items-end" onSubmit={handleAddTimetableEntry}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
                                    <select value={timetableForm.day_of_week} onChange={(e) => setTimetableForm({ ...timetableForm, day_of_week: e.target.value })} className="w-full px-3 py-2 border rounded">
                                        <option value="monday">Lundi</option>
                                        <option value="tuesday">Mardi</option>
                                        <option value="wednesday">Mercredi</option>
                                        <option value="thursday">Jeudi</option>
                                        <option value="friday">Vendredi</option>
                                        <option value="saturday">Samedi</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                                    <select value={timetableForm.subject_id} onChange={(e) => setTimetableForm({ ...timetableForm, subject_id: e.target.value })} className="w-full px-3 py-2 border rounded">
                                        <option value="">Sélectionner</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Professeur</label>
                                    <select value={timetableForm.teacher_id} onChange={(e) => setTimetableForm({ ...timetableForm, teacher_id: e.target.value })} className="w-full px-3 py-2 border rounded">
                                        <option value="">Sélectionner</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.first_name} {t.user?.last_name}</option>)}
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                                        <input type="time" value={timetableForm.start_time} onChange={(e) => setTimetableForm({ ...timetableForm, start_time: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                                        <input type="time" value={timetableForm.end_time} onChange={(e) => setTimetableForm({ ...timetableForm, end_time: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                                    <input value={timetableForm.room} onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })} className="w-full px-3 py-2 border rounded" />
                                </div>

                                <div className="col-span-2 flex justify-end gap-2">
                                    <Button type="button" variant="secondary" onClick={() => { setTimetableForm({ ...timetableForm, day_of_week: 'monday', start_time: '08:00', end_time: '09:00', teacher_id: '', subject_id: '', room: '' }); }}>Réinitialiser</Button>
                                    <Button type="submit">Ajouter</Button>
                                </div>
                            </form>
                        </div>

                        <div>
                            <TimetableGrid entries={timetableEntries} onDelete={handleDeleteTimetableEntry} />
                        </div>
                    </div>
                </div>
            )}

            {/* Class Detail Modal (Students list) */}
            {isClassDetailOpen && currentClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Élèves — {currentClass.name}</h2>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setIsClassDetailOpen(false)}>Fermer</Button>
                            </div>
                        </div>

                        <div>
                            <DataTable columns={classStudentColumns} data={classStudents} isLoading={classStudentsLoading} />
                        </div>
                    </div>
                </div>
            )}

            {/* Class View Modal (all details) */}
            {isClassViewOpen && classDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-3xl mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Détails de la classe — {classDetails.name}</h2>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setIsClassViewOpen(false)}>Fermer</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Nom</h3>
                                <p className="text-lg">{classDetails.name}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Code</h3>
                                <p className="text-lg">{classDetails.code}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Niveau</h3>
                                <p className="text-lg">{classDetails.level?.name || '—'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Capacité</h3>
                                <p className="text-lg">{classDetails.capacity ?? '—'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Année Académique</h3>
                                <p className="text-lg">{classDetails.academic_year || '—'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Statut</h3>
                                <p className="text-lg">{classDetails.status || '—'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Nombre d'élèves</h3>
                                <p className="text-lg">{classDetails.studentCount ?? '—'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700">Salle</h3>
                                <p className="text-lg">{classDetails.room || '—'}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => { if (classDetails.id) openClassDetail(classDetails); setIsClassViewOpen(false); }}>Voir les élèves</Button>
                            <Button onClick={() => { if (classDetails.id) openTimetable(classDetails); setIsClassViewOpen(false); }}>Voir l'emploi du temps</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
