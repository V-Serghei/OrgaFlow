import React, {useState, useEffect} from 'react';
import api from '../lib/api';
import '../src/app/globals.css';

const TaskForm = ({task, onSave}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (task) {
            setName(task.name);
            setDescription(task.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [task]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = {name, description};

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
            <div className="mb-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Task title"
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
        <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
        />
            </div>
            <button type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                {task ? 'Update' : 'Add'} task
            </button>
        </form>
    );
};

export default TaskForm;
