'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timetableAPI } from '@/lib/api';
import { TimetableGrid } from '@/components/TimetableGrid';
import { Clock } from 'lucide-react';

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      // The authenticated `user` may have a separate `teacherProfile` object.
      // Use `teacherProfile.id` when available, otherwise fall back to `user.id`.
      const teacherId = (user as any)?.teacherProfile?.id ?? (user as any)?.id;
      const res = await timetableAPI.getAll({ teacher_id: teacherId });
      setTimetables(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimetable = (id: number) => {
    console.log('Delete timetable:', id);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emploi du temps</h1>
        <p className="text-gray-600">Vue d'ensemble de vos cours pour l'année</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Calendrier des cours</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Chargement de l'emploi du temps...</p>
            </div>
          ) : timetables.length ? (
            <div className="overflow-x-auto">
              <TimetableGrid entries={timetables} onDelete={handleDeleteTimetable} />
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-1">Aucun cours planifié</p>
              <p className="text-gray-500 text-sm">Votre emploi du temps sera mis à jour dès que de nouveaux cours seront assignés</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
