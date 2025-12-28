'use client';

import React, { useEffect, useState } from 'react';
import { roomAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', capacity: '', location: '', status: 'active' });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await roomAPI.getAll();
      setRooms(res.data.data);
    } catch (err) {
      console.error('Error fetching rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRoom?.id) {
        await roomAPI.update(currentRoom.id, { ...formData, capacity: formData.capacity ? parseInt(formData.capacity) : null });
      } else {
        await roomAPI.create({ ...formData, capacity: formData.capacity ? parseInt(formData.capacity) : null });
      }
      setIsModalOpen(false);
      setCurrentRoom(null);
      setFormData({ name: '', code: '', capacity: '', location: '', status: 'active' });
      fetchRooms();
    } catch (err) {
      console.error('Error saving room', err);
      alert('Erreur lors de l\'enregistrement de la salle');
    }
  };

  const handleEdit = (room: any) => {
    setCurrentRoom(room);
    setFormData({ name: room.name || '', code: room.code || '', capacity: room.capacity ? String(room.capacity) : '', location: room.location || '', status: room.status || 'active' });
    setIsModalOpen(true);
  };

  const handleDelete = async (room: any) => {
    if (!confirm('Supprimer cette salle ?')) return;
    try {
      await roomAPI.delete(room.id);
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room', err);
      alert('Erreur lors de la suppression');
    }
  };

  const columns = [
    { header: 'Nom', accessorKey: 'name' },
    { header: 'Code', accessorKey: 'code' },
    { header: 'Capacité', accessorKey: (r: any) => r.capacity ?? '-' },
    { header: 'Localisation', accessorKey: 'location' },
    { header: 'Statut', accessorKey: 'status' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Salles</h1>
        <Button onClick={() => { setCurrentRoom(null); setFormData({ name: '', code: '', capacity: '', location: '', status: 'active' }); setIsModalOpen(true); }}>
          + Nouvelle Salle
        </Button>
      </div>

      <DataTable columns={columns} data={rooms} isLoading={loading} onEdit={handleEdit} onDelete={handleDelete} />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{currentRoom ? 'Modifier la salle' : 'Nouvelle salle'}</h2>
            <form onSubmit={handleSubmit}>
              <Input label="Nom" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <Input label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
              <Input label="Capacité" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
              <Input label="Localisation" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
