'use client';

import React, { useEffect, useState } from 'react';
import { parentAPI, classAPI } from '@/lib/api';
import { DataTable } from '@/components/DataTable';
import Link from 'next/link';

export default function AdminParentsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('last_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => { loadClasses(); }, []);

  useEffect(() => { loadParents(); }, [selectedClass, page, perPage, sortBy, sortDir]);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(res.data.data || []);
      // Auto-selection removed to allow "All classes"
    } catch (err) { console.error(err); }
  };

  const loadParents = async () => {
    setLoading(true);
    try {
      const res = await parentAPI.getByClass({ class_id: selectedClass, page, per_page: perPage, sort_by: sortBy, sort_dir: sortDir });
      setParents(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch (err) { console.error('Error loading parents', err); }
    setLoading(false);
  };

  const columns = [
    { header: 'Nom', accessorKey: 'last_name', cell: (row: any) => `${row.first_name} ${row.last_name}` },
    { header: 'Email', accessorKey: 'email', cell: (row: any) => row.email || '-' },
    { header: 'Téléphone', accessorKey: 'phone', cell: (row: any) => row.phone || '-' },
    { header: 'Enfants', accessorKey: 'children', cell: (row: any) => (row.children || []).join(', ') },
  ];

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parents / Tuteurs</h1>
          <p className="text-gray-600">Liste de tous les parents (pagination & tri)</p>
        </div>
        <div>
          <Link href="/admin/attendance" className="text-blue-600 hover:underline">Retour au registre</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
            <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">-- Toutes les classes --</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.level_name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="last_name">Nom</option>
              <option value="first_name">Prénom</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="asc">Ascendant</option>
              <option value="desc">Descendant</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Par page</label>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Parents</h2>
          <div className="text-sm text-gray-600">{total} parent(s)</div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : parents.length > 0 ? (
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={parents} isLoading={loading} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Aucun parent trouvé</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50">Précédent</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50">Suivant</button>
        </div>
      </div>
    </div>
  );
}
