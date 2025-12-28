'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            Swal.fire('Error', 'New passwords do not match', 'error');
            return;
        }

        setIsLoading(true);

        try {
            await authAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            await Swal.fire({
                title: 'Success!',
                text: 'Password changed successfully. Please login again with your new password.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
            });

            // Logout and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');

        } catch (error: any) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Change Password Required
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        For security reasons, you must change your default password before proceeding.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="my-4">
                            <label htmlFor="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Current Password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="my-4">
                            <label htmlFor="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="my-4">
                            <label htmlFor="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Confirm New Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Updating...
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
