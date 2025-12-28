'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

export default function ProfileView() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            await refreshUser();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>

            {/* User Info Card */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Prénom</label>
                        <p className="mt-1 text-sm text-gray-900">{user.first_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Nom</label>
                        <p className="mt-1 text-sm text-gray-900">{user.last_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Role</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {user.role.display_name}
                        </span>
                    </div>
                    {user.establishment && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500">Établissement</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {user.establishment.name} ({user.establishment.code})
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h2>

                {message && (
                    <div className={`p-4 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                        <input
                            type="password"
                            required
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Modification...' : 'Mettre à jour le mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    );
}
