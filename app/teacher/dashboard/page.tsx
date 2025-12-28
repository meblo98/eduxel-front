'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timetableAPI, classAPI } from '@/lib/api';
import { TimetableGrid } from '@/components/TimetableGrid';
import Link from 'next/link';
import { Clock, Users, ArrowRight } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ttRes = await timetableAPI.getAll({ teacher_id: user?.id });
      setTimetables(ttRes.data.data || []);

      const cRes = await classAPI.getAll({ teacher_id: user?.id });
      setClasses(cRes.data.data || []);
    } catch (err) {
      console.error('Error loading teacher dashboard', err);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, {user?.first_name || 'Enseignant'}</h1>
        <p className="text-gray-600">Gérez vos classes et votre emploi du temps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cours aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{timetables.length}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Classes</p>
              <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
            </div>
            <Users className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Emploi du temps</h2>
            <p className="text-sm text-gray-600 mt-1">Vos cours programmés</p>
          </div>
          <Link href="/teacher/timetable" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            Voir complet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Chargement...</p>
          </div>
        ) : timetables.length ? (
          <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
            <TimetableGrid entries={timetables} onDelete={handleDeleteTimetable} />
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <Clock className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun cours planifié pour aujourd'hui</p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Classes assignées</h2>
          <p className="text-sm text-gray-600 mt-1">Vos classes pour cette année</p>
        </div>
        {classes.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c: any) => (
              <Link key={c.id} href={`/teacher/classes/${c.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{c.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{c.level_name || 'Niveau non spécifié'}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500 opacity-20" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-600">{c.student_count || 0} élèves</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <Users className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucune classe assignée pour le moment</p>
          </div>
        )}
      </section>
    </div>
  );
}
