'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface TimetableEntry {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject: {
        name: string;
        color?: string;
    };
    teacher: {
        user: {
            first_name: string;
            last_name: string;
        };
    };
    room?: string;
}

interface TimetableGridProps {
    entries: TimetableEntry[];
    onDelete: (id: number) => void;
    onAddSlot?: (day: string, time: string) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00

export const TimetableGrid: React.FC<TimetableGridProps> = ({ entries, onDelete, onAddSlot }) => {

    // Helper to position items
    const getPosition = (start: string, end: string) => {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);

        const startOffset = (startHour - 8) * 60 + startMin;
        const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

        return {
            top: `${(startOffset / 60) * 100}px`, // 100px per hour
            height: `${(duration / 60) * 100}px`
        };
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[800px] border rounded-lg bg-white">
                <div className="grid grid-cols-7 border-b bg-gray-50">
                    <div className="p-4 border-r font-semibold text-gray-500 text-center">Heure</div>
                    {DAYS.map(day => (
                        <div key={day} className="p-4 border-r font-semibold text-gray-700 capitalize text-center">
                            {day === 'monday' ? 'Lundi' :
                                day === 'tuesday' ? 'Mardi' :
                                    day === 'wednesday' ? 'Mercredi' :
                                        day === 'thursday' ? 'Jeudi' :
                                            day === 'friday' ? 'Vendredi' : 'Samedi'}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 relative" style={{ height: '1100px' }}> {/* 11 hours * 100px */}

                    {/* Time Column */}
                    <div className="border-r bg-gray-50 relative">
                        {HOURS.map(hour => (
                            <div key={hour} className="absolute w-full border-b border-gray-200 text-xs text-gray-500 pr-2 text-right" style={{ top: `${(hour - 8) * 100}px` }}>
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {DAYS.map(day => (
                        <div key={day} className="border-r relative group">
                            {/* Grid Lines */}
                            {HOURS.map(hour => (
                                <div key={hour} className="absolute w-full border-b border-gray-100 h-[100px]" style={{ top: `${(hour - 8) * 100}px` }}>
                                    {/* Hover Add Button (Optional enhancement) */}
                                    {onAddSlot && (
                                        <button
                                            onClick={() => onAddSlot(day, `${hour}:00`)}
                                            className="w-full h-full opacity-0 group-hover:opacity-10 hover:bg-blue-200 transition-opacity"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Entries */}
                            {entries.filter(e => e.day_of_week === day).map(entry => {
                                const style = getPosition(entry.start_time, entry.end_time);
                                return (
                                    <div
                                        key={entry.id}
                                        className="absolute w-[95%] left-[2.5%] rounded p-2 text-xs shadow-sm border overflow-hidden hover:shadow-md transition-shadow group-entry"
                                        style={{
                                            ...style,
                                            backgroundColor: entry.subject.color || '#e0f2fe',
                                            borderColor: '#bae6fd'
                                        }}
                                    >
                                        <div className="font-bold text-blue-900 truncate">{entry.subject.name}</div>
                                        <div className="text-gray-600 truncate">{entry.teacher.user.first_name} {entry.teacher.user.last_name}</div>
                                        <div className="text-gray-500 truncate">{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</div>
                                        {entry.room && <div className="text-gray-500 italic truncate">Salle: {entry.room}</div>}

                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                                            className="absolute top-1 right-1 text-red-400 hover:text-red-700 opacity-0 group-entry-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .group-entry:hover .opacity-0 {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};
