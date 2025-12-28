'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { parentAPI } from '@/lib/api';
import { Calendar, Clock, MapPin, User, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

const DAYS = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
];

export default function ChildTimetablePage() {
    const { id } = useParams();
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadTimetable();
    }, [id]);

    const loadTimetable = async () => {
        try {
            const res = await parentAPI.getChildTimetable(Number(id));
            setTimetable(res.data.data || []);
        } catch (err) {
            console.error('Failed to load timetable', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const getDaySchedule = (day: string) => {
        return timetable.filter(entry => entry.day_of_week === day);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/parent/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Emploi du temps</h1>
            </div>

            {timetable.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Emploi du temps non défini</h3>
                    <p className="text-gray-500">Aucun emploi du temps n'a été publié pour la classe de votre enfant.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {DAYS.map((day) => {
                        const schedule = getDaySchedule(day.key);
                        return (
                            <div key={day.key} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[300px]">
                                <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        {day.label}
                                    </h3>
                                </div>
                                <div className="p-4 flex-1 space-y-4">
                                    {schedule.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm italic py-8">
                                            Pas de cours
                                        </div>
                                    ) : (
                                        schedule.map((entry) => (
                                            <div key={entry.id} className="relative pl-4 border-l-4 rounded-r-lg bg-gray-50 p-3" style={{ borderLeftColor: entry.subject?.color || '#3b82f6' }}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{entry.subject?.name}</h4>
                                                    <span className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded shadow-sm text-gray-500">
                                                        {entry.room || 'TBD'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                        <span>{entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <User className="w-3 h-3 text-gray-400" />
                                                        <span>{entry.teacher?.user?.first_name} {entry.teacher?.user?.last_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
