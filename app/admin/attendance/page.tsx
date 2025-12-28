'use client';

import React, { useEffect, useState } from 'react';
import { attendanceAPI, classAPI, timetableAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { DataTable } from '@/components/DataTable';
import { CheckCircle, XCircle, Clock, FileText, Edit2, X } from 'lucide-react';

export default function AdminAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<string>('present');
  const [editReason, setEditReason] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Search and filter states
  const [searchStudentName, setSearchStudentName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadClasses();
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      loadTimetables(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass || selectedDate) {
      loadAttendance();
    }
    
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(res.data.data || []);
      // Auto-select first class
      if (res.data.data?.length > 0) {
        setSelectedClass(res.data.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching classes', err);
    }
  };
  

  const loadTimetables = async (classId: string) => {
    try {
      const res = await timetableAPI.getAll({ class_id: classId });
      setTimetables(res.data.data || []);
    } catch (err) {
      console.error('Error fetching timetables', err);
    }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getAll({
        class_id: selectedClass,
        date: selectedDate
      });
      setRecords(res.data || []);
    } catch (err) {
      console.error('Error fetching attendance', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter records based on search and status
  useEffect(() => {
    let filtered = records;

    // Search by student name
    if (searchStudentName.trim()) {
      const query = searchStudentName.toLowerCase();
      filtered = filtered.filter((r) =>
        `${r.student?.user?.first_name || ''} ${r.student?.user?.last_name || ''}`.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    setFilteredRecords(filtered);
  }, [records, searchStudentName, filterStatus]);

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditReason(record.reason || '');
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setSavingEdit(true);
    try {
      await attendanceAPI.bulkMark({
        date: selectedDate,
        class_id: selectedClass,
        entries: [{ student_id: editingRecord.student_id, status: editStatus, reason: editReason }]
      });
      // Reload attendance
      await loadAttendance();
      setEditingRecord(null);
    } catch (err) {
      console.error('Error saving edit', err);
    } finally {
      setSavingEdit(false);
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

  // Helper to get course info from timetables
  const getCourseInfo = () => {
    if (timetables.length === 0) return null;
    // Find timetable entries for today's date (or display all if different date selected)
    const dayOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][new Date(selectedDate).getDay()];
    const entry = timetables.find((t: any) => t.day_of_week?.toLowerCase() === dayOfWeek?.toLowerCase());
    return entry ? { time: `${entry.start_time} - ${entry.end_time}`, subject: entry.subject?.name || 'Matière' } : null;
  };

  const columns = [
    {
      header: 'Élève',
      accessorKey: 'student',
      cell: (row: any) => `${row.student?.user?.first_name || ''} ${row.student?.user?.last_name || ''}`
    },
    {
      header: 'Matricule',
      accessorKey: 'student',
      cell: (row: any) => row.student?.student_code || ''
    },
    {
      header: 'Cours',
      cell: () => {
        const courseInfo = getCourseInfo();
        return courseInfo ? courseInfo.subject : '-';
      }
    },
    {
      header: 'Heure du cours',
      cell: () => {
        const courseInfo = getCourseInfo();
        return courseInfo ? courseInfo.time : '-';
      }
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
    },
    {
      header: 'Actions',
      cell: (row: any) => (
        <button
          onClick={() => handleEditClick(row)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-blue-600 hover:bg-blue-50"
          title="Modifier"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  // Count summary
  const present = records.filter((r: any) => r.status === 'present').length;
  const absent = records.filter((r: any) => r.status === 'absent').length;
  const late = records.filter((r: any) => r.status === 'late').length;
  const excused = records.filter((r: any) => r.status === 'excused').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi de la présence</h1>
        <p className="text-gray-600">Visualisez et suivez les absences des élèves par classe et par date</p>
        <div className="mt-2">
          <Link href="/admin/parents" className="text-blue-600 hover:underline text-sm">Voir la liste des parents</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">-- Sélectionner une classe --</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher élève</label>
            <input
              type="text"
              placeholder="Nom de l'élève..."
              value={searchStudentName}
              onChange={(e) => setSearchStudentName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Tous les statuts</option>
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="late">Retard</option>
              <option value="excused">Justifié</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Présents</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{present}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Absents</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{absent}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">Retards</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{late}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Justifiés</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{excused}</p>
          </div>
        </div>
      )}

      

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registre de présence</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={filteredRecords} isLoading={loading} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Aucun enregistrement de présence pour cette sélection</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Edit Modal */}
    {editingRecord && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Modifier la présence - {editingRecord.student?.user?.first_name} {editingRecord.student?.user?.last_name}
            </h3>
            <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="late">Retard</option>
                <option value="excused">Justifié</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remarques</label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Ajouter une remarque..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingEdit ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  );
}
