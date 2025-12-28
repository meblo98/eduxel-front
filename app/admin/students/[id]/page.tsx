'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { studentAPI, attendanceAPI } from '@/lib/api';
import { DataTable } from '@/components/DataTable';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentDetail() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudent();
      loadAttendance();
    }
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getOne(Number(studentId));
      setStudent(res.data.data);
    } catch (err) {
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const res = await attendanceAPI.getByStudent(Number(studentId));
      // Handle both array and nested data structure
      const attendanceData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setAttendance(attendanceData);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Présent</span>;
      case 'absent':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium"><XCircle className="w-4 h-4" /> Absent</span>;
      case 'late':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium"><Clock className="w-4 h-4" /> Retard</span>;
      case 'excused':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium"><FileText className="w-4 h-4" /> Justifié</span>;
      default:
        return status;
    }
  };

  const attendanceColumns = [
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row: any) => new Date(row.date).toLocaleDateString('fr-FR')
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: (row: any) => getStatusBadge(row.status)
    },
    {
      header: 'Heure d\'arrivée',
      accessorKey: 'arrival_time',
      cell: (row: any) => row.arrival_time || '-'
    },
    {
      header: 'Remarques',
      accessorKey: 'reason',
      cell: (row: any) => row.reason || '-'
    },
    {
      header: 'Marqué par',
      accessorKey: 'markedBy',
      cell: (row: any) => `${row.markedBy?.first_name || ''} ${row.markedBy?.last_name || ''}`
    }
  ];

  // Calculate attendance statistics
  const stats = {
    total: attendance.length,
    present: attendance.filter((a: any) => a.status === 'present').length,
    absent: attendance.filter((a: any) => a.status === 'absent').length,
    late: attendance.filter((a: any) => a.status === 'late').length,
    excused: attendance.filter((a: any) => a.status === 'excused').length
  };

  const attendanceRate = stats.total > 0 ? ((stats.present + stats.excused) / stats.total * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement des données de l'élève...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Élève non trouvé</p>
          <Link href="/admin/students" className="text-blue-600 hover:underline mt-4 inline-block">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/students" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {student.user?.first_name} {student.user?.last_name}
        </h1>
        <p className="text-gray-600">Matricule: {student.student_code}</p>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Classe</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{student.class?.name || '-'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Email</p>
          <p className="text-lg font-mono text-gray-900 mt-2 break-all">{student.user?.email || '-'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Genre</p>
          <p className="text-lg font-bold text-gray-900 mt-2">
            {student.user?.gender === 'male' ? 'M' : student.user?.gender === 'female' ? 'F' : student.user?.gender === 'other' ? 'Autre' : '-'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Téléphone</p>
          <p className="text-lg font-bold text-gray-900 mt-2">{student.user?.phone || '-'}</p>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Présences</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.present}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium">Absences</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.absent}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium">Retards</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.late}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Taux présence</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{attendanceRate}%</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique de présence</h2>
        </div>
        <div className="p-6">
          {attendanceLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Chargement de l'historique...</p>
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <DataTable columns={attendanceColumns} data={attendance} isLoading={attendanceLoading} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Aucun enregistrement de présence pour cet élève</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
