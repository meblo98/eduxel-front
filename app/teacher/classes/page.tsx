'use client';

import React, { useEffect, useState } from 'react';
import { classAPI, studentAPI, timetableAPI, attendanceAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from '@/components/DataTable';
import Link from 'next/link';
import { BookOpen, Users, ArrowRight, Clock, Calendar } from 'lucide-react';

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [timetablesMap, setTimetablesMap] = useState<Record<string, any[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const teacherId = (user as any)?.teacherProfile?.id ?? (user as any)?.id;
      const res = await classAPI.getAll({ teacher_id: teacherId });
      const classesData = res.data.data || [];

      // Fetch students and timetables for each class
      const studentsResponses = await Promise.all(
        classesData.map((c: any) =>
          studentAPI
            .getAll({ class_id: c.id })
            .catch(() => ({ data: { data: [] } }))
        )
      );

      const timetablesResponses = await Promise.all(
        classesData.map((c: any) =>
          timetableAPI
            .getAll({ class_id: c.id })
            .catch(() => ({ data: { data: [] } }))
        )
      );

      const studentsMapLocal: Record<string, any[]> = {};
      const timetablesMapLocal: Record<string, any[]> = {};
      
      classesData.forEach((c: any, idx: number) => {
        studentsMapLocal[c.id] = studentsResponses[idx].data.data || [];
        timetablesMapLocal[c.id] = timetablesResponses[idx].data.data || [];
      });

      console.debug('Teacher classes load:', { teacherId, classesData, timetablesMapLocal });

      setClasses(classesData);
      setStudentsMap(studentsMapLocal);
      setTimetablesMap(timetablesMapLocal);
    } catch (err) {
      console.error('Error fetching classes', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Nom',
      accessorKey: 'name'
    },
    {
      header: 'Niveau',
      accessorKey: 'level_name'
    },
    {
      header: 'Élèves',
      accessorKey: 'student_count',
      cell: (row: any) => row.student_count || 0
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes classes</h1>
        <p className="text-gray-600">Gérez vos classes et accédez aux listes d'élèves</p>
      </div>

      {!loading && classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total des classes</p>
                <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total d'élèves</p>
                <p className="text-3xl font-bold text-gray-900">{classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}</p>
              </div>
              <Users className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement des classes...</p>
        </div>
      ) : classes.length > 0 ? (
        <div>
              <div className="space-y-4">
                {classes.map((c: any) => (
                  <div key={c.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                        <p className="text-sm text-gray-600">{c.level_name}</p>
                      </div>
                      <div className="text-sm text-gray-500">{(studentsMap[c.id] || []).length} élèves</div>
                    </div>

                    {/* Date and Time Selection for Attendance */}
                    <div className="p-4 border-b border-gray-100 bg-blue-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date du cours</label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Horaire</label>
                          <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">-- Sélectionner l'horaire --</option>
                            {(timetablesMap[c.id] || []).map((t: any) => (
                              <option key={t.id} value={`${t.start_time}-${t.end_time}`}>
                                {t.start_time} - {t.end_time} ({t.subject?.name || 'Matière'})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {(studentsMap[c.id] || []).length > 0 ? (
                        <div className="space-y-2">
                              {(studentsMap[c.id] || []).map((s: any) => (
                                <div key={s.id} className="p-3 border rounded flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{s.user?.first_name || s.first_name} {s.user?.last_name || s.last_name}</p>
                                    <p className="text-sm text-gray-500">{s.student_code || s.admission_no || ''}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={attendanceMap[s.id] || 'present'}
                                      onChange={(e) => setAttendanceMap(prev => ({ ...prev, [s.id]: e.target.value }))}
                                      className="border rounded px-2 py-1"
                                    >
                                      <option value="present">Présent</option>
                                      <option value="absent">Absent</option>
                                      <option value="late">Retard</option>
                                      <option value="excused">Justifié</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">Aucun élève dans cette classe</div>
                      )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                      <Link href={`/teacher/classes/${c.id}`} className="text-blue-600 hover:underline font-medium">Voir le détail</Link>
                      <div>
                        <button
                          onClick={async () => {
                            if (!selectedDate) {
                              alert('Veuillez sélectionner une date');
                              return;
                            }
                            const entries = (studentsMap[c.id] || []).map((s: any) => ({ student_id: s.id, status: attendanceMap[s.id] || 'present' }));
                            if (!entries.length) return;
                            setSavingAttendance(true);
                            try {
                              await attendanceAPI.bulkMark({ date: selectedDate, class_id: c.id, entries });
                              console.debug('Attendance saved for class', c.id);
                              alert('Présence enregistrée avec succès');
                            } catch (err) {
                              console.error('Error saving attendance', err);
                              alert('Erreur lors de l\'enregistrement');
                            } finally {
                              setSavingAttendance(false);
                            }
                          }}
                          disabled={savingAttendance || !selectedDate}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Calendar className="w-4 h-4" />
                          Enregistrer la présence
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex justify-center">
                  <Link href="/teacher/timetable" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    <Clock className="w-4 h-4" />
                    Voir l'emploi du temps
                  </Link>
                </div>
              </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-1">Aucune classe assignée</p>
          <p className="text-gray-500 text-sm">Vous n'avez actuellement aucune classe. Contactez l'administration.</p>
        </div>
      )}
    </div>
  );
}
