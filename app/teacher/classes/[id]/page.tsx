'use client';

import React, { useEffect, useState } from 'react';
import { studentAPI, classAPI, attendanceAPI } from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, UserCircle, CalendarX, ArrowLeft, MoreVertical, Plus, CheckCircle, Clock } from 'lucide-react';
import { StudentDetailModal } from '@/components/teacher/StudentDetailModal';
import { AddGradeModal } from '@/components/teacher/AddGradeModal';
import Swal from 'sweetalert2';

function ClassDetail({ classId }: { classId: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState<any>(null);

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);

  useEffect(() => {
    load();
  }, [classId]);

  const load = async () => {
    setLoading(true);
    try {
      const cReq = classAPI.getOne(Number(classId));
      const sReq = studentAPI.getAll({ class_id: classId });

      const [sRes, cRes] = await Promise.all([sReq, cReq]);
      setStudents(sRes.data.data || []);
      setClassInfo(cRes.data.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendanceQuick = async (studentId: number, status: 'present' | 'absent' | 'late') => {
    const statusLabels = {
      present: { label: 'présent', color: '#10b981' },
      absent: { label: 'absent', color: '#ef4444' },
      late: { label: 'en retard', color: '#f59e0b' }
    };

    const result = await Swal.fire({
      title: `Marquer ${statusLabels[status].label} ?`,
      text: `Voulez-vous marquer cet élève ${statusLabels[status].label} pour aujourd'hui ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: statusLabels[status].color,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await attendanceAPI.bulkMark({
          date: new Date().toISOString().split('T')[0],
          class_id: Number(classId),
          entries: [{ student_id: studentId, status }]
        });
        Swal.fire({
          title: 'Enregistré',
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } catch (error: any) {
        Swal.fire('Erreur', error.message || 'Echec', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Link href="/teacher/classes" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4 group font-medium">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux classes
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{classInfo?.name || 'Chargement...'}</h1>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{classInfo?.level_name}</span>
                • {students.length} élèves inscrits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">Liste des élèves</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un élève..."
              className="pl-4 pr-10 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl w-full md:w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center animate-pulse">
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400 font-medium">Chargement de la classe...</p>
            </div>
          ) : students.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Élève</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Matricule</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sexe</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{student.user?.first_name} {student.user?.last_name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">{student.user?.email || 'Pas d\'email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{student.student_code}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${student.user?.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                        {student.user?.gender === 'male' ? 'Garçon' : 'Fille'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedStudent(student); setShowDetailModal(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Détails"
                        >
                          <UserCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(student); setShowGradeModal(true); }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Ajouter une note"
                        >
                          <FileText className="w-5 h-5" />
                        </button>

                        <div className="h-6 w-px bg-gray-100 mx-1"></div>

                        <button
                          onClick={() => markAttendanceQuick(student.id, 'present')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Marquer présent"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => markAttendanceQuick(student.id, 'late')}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Marquer en retard"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => markAttendanceQuick(student.id, 'absent')}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Marquer absent"
                        >
                          <CalendarX className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">Aucun élève trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedStudent && (
        <>
          <StudentDetailModal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            studentId={selectedStudent.id}
          />
          <AddGradeModal
            isOpen={showGradeModal}
            onClose={() => setShowGradeModal(false)}
            student={selectedStudent}
            onSuccess={() => {/* Maybe refresh data here */ }}
          />
        </>
      )}
    </div>
  );
}

export default function PageWrapper() {
  const params = useParams();
  const classId = params?.id as string;

  return <ClassDetail classId={classId} />;
}
