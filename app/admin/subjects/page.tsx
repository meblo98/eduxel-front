'use client';

import React, { useState, useEffect } from 'react';
import { subjectAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';

interface SubjectData {
    id: number;
    name: string;
    code: string;
    coefficient: number;
    description: string;
    color: string;
}

export default function SubjectsPage() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Partial<SubjectData> | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        coefficient: 1,
        description: '',
        color: '#3B82F6'
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const response = await subjectAPI.getAll();
            setSubjects(response.data.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            header: 'Couleur',
            accessorKey: 'color' as keyof SubjectData,
            cell: (row: SubjectData) => (
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: row.color }}></div>
            )
        },
        { header: 'Matière', accessorKey: 'name' as keyof SubjectData },
        { header: 'Code', accessorKey: 'code' as keyof SubjectData },
        { header: 'Coefficient', accessorKey: 'coefficient' as keyof SubjectData },
        { header: 'Description', accessorKey: 'description' as keyof SubjectData },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentSubject?.id) {
                await subjectAPI.update(currentSubject.id, formData);
            } else {
                await subjectAPI.create({
                    ...formData,
                    establishment_id: user?.establishment?.id
                });
            }
            setIsModalOpen(false);
            fetchSubjects();
            resetForm();
        } catch (error) {
            console.error('Error saving subject:', error);
            alert('Erreur lors de l\'enregistrement de la matière');
        }
    };

    const handleEdit = (subject: SubjectData) => {
        setCurrentSubject(subject);
        setFormData({
            name: subject.name,
            code: subject.code,
            coefficient: subject.coefficient,
            description: subject.description || '',
            color: subject.color || '#3B82F6'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (subject: SubjectData) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
            try {
                await subjectAPI.delete(subject.id);
                fetchSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
                alert('Erreur lors de la suppression de la matière');
            }
        }
    };

    const resetForm = () => {
        setCurrentSubject(null);
        setFormData({
            name: '',
            code: '',
            coefficient: 1,
            description: '',
            color: '#3B82F6'
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Matières</h1>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    + Nouvelle Matière
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={subjects}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{currentSubject ? 'Modifier la Matière' : 'Nouvelle Matière'}</h2>
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Nom de la matière"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="ex: Mathématiques"
                            />
                            <Input
                                label="Code de la matière"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                                placeholder="ex: MATH"
                            />
                            <Input
                                label="Coefficient"
                                type="number"
                                step="0.1"
                                value={formData.coefficient}
                                onChange={(e) => setFormData({ ...formData, coefficient: parseFloat(e.target.value) })}
                                required
                            />
                            <Input
                                label="Couleur"
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="h-12"
                            />
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />

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
