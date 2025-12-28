'use client';

import React, { useState, useEffect } from 'react';
    import { User, Hash, School, Mail, Activity, Phone, Users, Eye, Trash2 } from 'lucide-react';
import { studentAPI, classAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface StudentData {
    id: number;
    student_code: string;
    user: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        gender?: string;
        status: string;
    };
    class: {
        id: number;
        name: string;
    };
    enrollment_date: string;
    status: string;
}

export default function StudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<StudentData[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<any | null>(null);
    const [showTrash, setShowTrash] = useState(false);

    const [credentialsModal, setCredentialsModal] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<any>(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        student_code: '',
        class_id: '',
        dateOfBirth: '',
        gender: 'male',
        address: '',
        parent: {
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        }
    });

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    useEffect(() => {
        // Reload students when toggling trash view
        fetchStudents();
    }, [showTrash]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = showTrash ? await studentAPI.getTrashed() : await studentAPI.getAll();
            setStudents(response.data.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter students based on search and filter criteria
    useEffect(() => {
        let filtered = students;

        // Search filter (name, email, student code)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((s) =>
                `${s.user.first_name} ${s.user.last_name}`.toLowerCase().includes(query) ||
                s.user.email.toLowerCase().includes(query) ||
                s.student_code.toLowerCase().includes(query)
            );
        }

        // Class filter
        if (filterClass) {
            filtered = filtered.filter((s) => s.class?.id?.toString() === filterClass);
        }

        // Status filter
        if (filterStatus) {
            filtered = filtered.filter((s) => s.status === filterStatus);
        }

        setFilteredStudents(filtered);
    }, [students, searchQuery, filterClass, filterStatus]);

    const fetchClasses = async () => {
        try {
            const response = await classAPI.getAll();
            setClasses(response.data.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const columns = [
        {
            header: (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Nom de l'élève</span>
                </div>
            ),
            accessorKey: 'user' as keyof StudentData,
            cell: (row: StudentData) => `${row.user.first_name} ${row.user.last_name}`
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    <span>Code</span>
                </div>
            ),
            accessorKey: 'student_code' as keyof StudentData
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    <span>Classe</span>
                </div>
            ),
            accessorKey: 'class' as keyof StudentData,
            cell: (row: StudentData) => row.class?.name || 'Non assigné'
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                </div>
            ),
            accessorKey: 'user' as keyof StudentData,
            cell: (row: StudentData) => row.user.email
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Sexe</span>
                </div>
            ),
            accessorKey: 'user' as keyof StudentData,
            cell: (row: StudentData) => {
                // @ts-ignore - access gender from user
                const gender = row.user.gender;
                return (
                    <span className="text-sm">
                        {gender === 'male' ? 'Masculin' : gender === 'female' ? 'Féminin' : gender === 'other' ? 'Autre' : 'Non spécifié'}
                    </span>
                );
            }
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Statut</span>
                </div>
            ),
            accessorKey: 'status' as keyof StudentData,
            cell: (row: StudentData) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (row: StudentData) => (
                <div className="flex items-center gap-2">
                    {showTrash ? (
                        <>
                            <button
                                onClick={() => handleRestore(row)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-green-600 hover:bg-green-50"
                                title="Restaurer"
                            >
                                Restaurer
                            </button>
                            <button
                                onClick={() => handleDelete(row)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-600 hover:bg-red-50"
                                title="Supprimer définitivement"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleDelete(row)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-600 hover:bg-red-50"
                            title="Supprimer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentStudent?.id) {
                await studentAPI.update(currentStudent.id, formData);
                setIsModalOpen(false);
                resetForm();
                fetchStudents();
            } else {
                const response = await studentAPI.create({
                    ...formData,
                    establishment_id: user?.establishment?.id
                });

                // Check for credentials in response
                if (response.data.data.credentials) {
                    setCreatedCredentials({
                        studentName: `${formData.firstName} ${formData.lastName}`,
                        studentEmail: formData.email,
                        studentPassword: response.data.data.credentials.studentPassword,
                        parentName: `${formData.parent.firstName} ${formData.parent.lastName}`,
                        parentEmail: formData.parent.email,
                        parentPassword: response.data.data.credentials.parentPassword
                    });
                    setIsModalOpen(false);
                    setCredentialsModal(true); // Open credentials modal
                    fetchStudents();
                    resetForm();
                } else {
                    setIsModalOpen(false);
                    fetchStudents();
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Error saving student:', error);
            // @ts-ignore
            alert('Erreur lors de l\'enregistrement de l\'élève: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (student: StudentData) => {
        setCurrentStudent(student);
        // @ts-ignore - access parent if populated
        const parent = student.parent;

        setFormData({
            firstName: student.user.first_name,
            lastName: student.user.last_name,
            email: student.user.email,
            phone: student.user.phone || '',
            student_code: student.student_code,
            class_id: student.class?.id?.toString() || '',
            dateOfBirth: '', // If available in API
            gender: student.user.gender || 'male', // If available
            address: '', // If available
            parent: {
                firstName: parent?.first_name || '',
                lastName: parent?.last_name || '',
                email: parent?.email || '',
                phone: parent?.phone || ''
            }
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (student: StudentData) => {
        if (!showTrash) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
                try {
                    await studentAPI.delete(student.id);
                    fetchStudents();
                } catch (error) {
                    console.error('Error deleting student:', error);
                    alert('Erreur lors de la suppression de l\'élève');
                }
            }
        } else {
            // When viewing trash, offer permanent delete
            if (confirm('Supprimer définitivement cet élève ? Cette action est irréversible.')) {
                try {
                    await studentAPI.forceDelete(student.id);
                    fetchStudents();
                } catch (error) {
                    console.error('Error permanently deleting student:', error);
                    alert('Erreur lors de la suppression définitive');
                }
            }
        }
    };

    const handleRestore = async (student: StudentData) => {
        if (confirm('Restaurer cet élève depuis la corbeille ?')) {
            try {
                await studentAPI.restore(student.id);
                fetchStudents();
            } catch (error) {
                console.error('Error restoring student:', error);
                alert('Erreur lors de la restauration');
            }
        }
    };

    const resetForm = () => {
        setCurrentStudent(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            student_code: '',
            class_id: '',
            dateOfBirth: '',
            gender: 'male',
            address: '',
            parent: {
                firstName: '',
                lastName: '',
                email: '',
                phone: ''
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Élèves</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setShowTrash(!showTrash); fetchStudents(); }}
                        className={`px-3 py-2 rounded-md border ${showTrash ? 'bg-gray-100' : 'bg-white'}`}
                    >
                        {showTrash ? 'Voir actifs' : 'Corbeille'}
                    </button>
                    {!showTrash && (
                        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                            + Nouvel Élève
                        </Button>
                    )}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                        <Input
                            placeholder="Nom, email ou code élève..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {!showTrash && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Toutes les classes</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="active">Actif</option>
                                    <option value="graduated">Diplômé</option>
                                    <option value="transferred">Transféré</option>
                                    <option value="expelled">Expulsé</option>
                                    <option value="inactive">Inactif</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setSearchQuery(''); setFilterClass(''); setFilterStatus(''); }}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </>
                    )}
                </div>
                {filteredStudents.length !== students.length && (
                    <p className="text-sm text-gray-600 mt-2">
                        {filteredStudents.length} élève(s) sur {students.length}
                    </p>
                )}
            </div>

            <DataTable
                columns={columns}
                data={filteredStudents}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                extraActions={[
                    {
                        icon: <Eye className="h-4 w-4" />,
                        title: 'Voir le détail',
                        onClick: (row: StudentData) => {
                            // Navigate to student detail page using Link
                            window.location.href = `/admin/students/${row.id}`;
                        }
                    }
                ]}
            />

            {/* Student Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
                        <h2 className="text-xl font-bold mb-4">{currentStudent ? 'Modifier l\'élève' : 'Nouvel Élève'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <h3 className="col-span-full font-semibold text-gray-700 border-b pb-2">Informations de l'Élève</h3>
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
                                    label="Date de Naissance"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        required
                                    >
                                        <option value="male">Masculin</option>
                                        <option value="female">Féminin</option>
                                        <option value="other">Autre</option>
                                    </select>
                                </div>
                                <Input
                                    label="Code Élève"
                                    value={formData.student_code}
                                    onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                                    required
                                />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    >
                                        <option value="">Sélectionner une classe</option>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <h3 className="col-span-full font-semibold text-gray-700 border-b pb-2">Informations du Tuteur</h3>
                                <Input
                                    label="Prénom du Tuteur"
                                    value={formData.parent.firstName}
                                    onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, firstName: e.target.value } })}
                                    required={!currentStudent} // Required only for new students ideally, or business rule
                                />
                                <Input
                                    label="Nom du Tuteur"
                                    value={formData.parent.lastName}
                                    onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, lastName: e.target.value } })}
                                    required={!currentStudent}
                                />
                                <Input
                                    label="Email du Tuteur"
                                    type="email"
                                    value={formData.parent.email}
                                    onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, email: e.target.value } })}
                                    required={!currentStudent}
                                />
                                <Input
                                    label="Téléphone du Tuteur"
                                    value={formData.parent.phone}
                                    onChange={(e) => setFormData({ ...formData, parent: { ...formData.parent, phone: e.target.value } })}
                                    required={!currentStudent}
                                />
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

            {/* Credentials Success Modal */}
            {credentialsModal && createdCredentials && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Élève inscrit avec succès !</h3>
                            <p className="mt-2 text-sm text-gray-500">Voici les identifiants de connexion générés.</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Compte Élève</h4>
                            <p className="text-sm"><span className="font-semibold">Email:</span> {createdCredentials.studentEmail}</p>
                            <p className="text-sm"><span className="font-semibold">Mot de passe:</span> {createdCredentials.studentPassword}</p>
                        </div>

                        {createdCredentials.parentPassword && (
                            <div className="bg-gray-50 p-4 rounded-md mb-4">
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Compte Parent (Nouveau)</h4>
                                <p className="text-sm"><span className="font-semibold">Email:</span> {createdCredentials.parentEmail}</p>
                                <p className="text-sm"><span className="font-semibold">Mot de passe:</span> {createdCredentials.parentPassword}</p>
                            </div>
                        )}

                        {!createdCredentials.parentPassword && (
                            <div className="bg-blue-50 p-3 rounded-md mb-4">
                                <p className="text-sm text-blue-700">Le compte parent existait déjà et a été lié avec succès.</p>
                            </div>
                        )}

                        <div className="mt-5 sm:mt-6">
                            <div className="mb-4 text-xs text-red-500 text-center">
                                Copiez ces informations maintenant, elles ne seront plus affichées !
                            </div>
                            <Button className="w-full justify-center" onClick={() => setCredentialsModal(false)}>
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
