import React, { useState, useEffect } from 'react';
import api from '../lib/api';
const TaskForm = ({ task, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = { name, description, startDate, endDate };
        try {
            if (task) {
                await api.put(`/${task.id}`, taskData);
            } else {
                await api.post('/', taskData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-800 p-6 rounded shadow-md">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button type="submit">Save</button>
        </form>
    );
};

export default TaskForm;
