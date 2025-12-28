'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Redirect based on role
                const roleName = user.role.name;
                switch (roleName) {
                    case 'super_admin':
                        router.push('/super-admin/dashboard');
                        break;
                    case 'admin':
                        router.push('/admin/dashboard');
                        break;
                    case 'teacher':
                        router.push('/teacher/dashboard');
                        break;
                    case 'staff':
                        router.push('/staff/dashboard');
                        break;
                    case 'parent':
                        router.push('/parent/dashboard');
                        break;
                    case 'student':
                        router.push('/student/dashboard');
                        break;
                    default:
                        router.push('/login');
                }
            } else {
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return null;
}
