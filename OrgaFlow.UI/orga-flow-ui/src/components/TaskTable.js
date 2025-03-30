import React, { useState, useEffect } from 'react';
import apiNotify from '../lib/apiNotify';
const TaskTable = ({ tasks, onEdit, onDelete }) => {
    const handleSubscribe = async (task) => {
        try {
            await apiNotify.post('/subscribe', task);
            alert('Подписка на уведомления успешно оформлена!');
        } catch (error) {
            console.error('Error subscribing to notifications:', error);
            alert('Ошибка при подписке на уведомления.');
        }
    };

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
                        <td className="px-6 py-4 border-b text-sm text-blue-400">{task.name}</td>
                        <td className="px-6 py-4 border-b text-sm text-gray-200">{task.description}</td>
                        <td className="px-6 py-4 border-b text-sm space-x-2">
                            <button onClick={() => onEdit(task)} className="bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
                            <button onClick={() => handleSubscribe(task)} className="bg-green-600 text-white px-4 py-2 rounded">Notify</button>
                            <button onClick={() => onDelete(task.id)} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaskTable;
