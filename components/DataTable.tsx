'use client';

import React from 'react';
import { Button } from './ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

interface Column<T> {
    header: string | React.ReactNode;
    accessorKey: keyof T | ((row: T) => React.ReactNode);
    cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    extraActions?: Array<{
        icon: React.ReactNode;
        title?: string;
        onClick: (row: T) => void;
        variant?: string;
        size?: 'sm' | 'md' | 'lg';
    }>;
    isLoading?: boolean;
}

export function DataTable<T extends { id: number | string }>({
    columns,
    data,
    onEdit,
    onDelete,
    extraActions,
    isLoading
}: DataTableProps<T>) {
    if (isLoading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    if (!data?.length) {
        return <div className="p-4 text-center text-gray-500">No data found</div>;
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} scope="col" className="px-6 py-3">
                                {col.header}
                            </th>
                        ))}
                        {(onEdit || onDelete || (extraActions && extraActions.length > 0)) && (
                            <th scope="col" className="px-6 py-3 text-right">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                            {columns.map((col, index) => (
                                <td key={index} className="px-6 py-4">
                                    {col.cell
                                        ? col.cell(row)
                                        : typeof col.accessorKey === 'function'
                                            ? col.accessorKey(row)
                                            : (row[col.accessorKey as keyof T] as React.ReactNode)}
                                </td>
                            ))}
                            {(onEdit || onDelete || (extraActions && extraActions.length > 0)) && (
                                <td className="px-6 py-4 text-right space-x-2">
                                    {extraActions && extraActions.map((a, i) => (
                                        <Button key={i} size={a.size as any || 'sm'} onClick={() => a.onClick(row)} title={a.title}>
                                            {a.icon}
                                        </Button>
                                    ))}

                                    {onEdit && (
                                        <Button
                                            size="sm"
                                            onClick={() => onEdit(row)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Modifier"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(row)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
