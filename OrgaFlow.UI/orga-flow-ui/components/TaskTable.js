import React from 'react';
import Link from 'next/link';
import api from '../lib/api';
import '../src/app/globals.css';

const TaskTable = ({ tasks, onEdit, onDelete }) => {
    const handleDelete = async (id) => {
        try {
            await api.delete(`/${id}`);
            onDelete();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    if (tasks.length === 0) {
        return <p className="text-center text-gray-400">No tasks found.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded shadow animate-fadeIn">
                <thead>
                <tr className="bg-gray-700">
                    <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-300">ID</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-300">Description</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-600 transition-colors duration-300">
                        <td className="px-6 py-4 border-b text-sm text-gray-200">{task.id}</td>
                        <td className="px-6 py-4 border-b text-sm text-blue-400 hover:underline max-w-xs truncate">
                            <Link href={`/tasks/${task.id}`}>{task.name}
                            </Link>
                        </td>
                        <td className="px-6 py-4 border-b text-sm text-gray-200 max-w-xs truncate">
                            {task.description}
                        </td>
                        <td className="px-6 py-4 border-b text-sm space-x-2">
                            <button
                                onClick={() => onEdit(task)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition transform hover:scale-105"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition transform hover:scale-105"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaskTable;
