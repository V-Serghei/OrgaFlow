import {useState, useEffect} from 'react';
import TaskForm from '../components/TaskForm';
import TaskTable from '../components/TaskTable';
import api from '../lib/api';
import '../src/app/globals.css';

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/');
            setTasks(response.data);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSave = () => {
        setEditingTask(null);
        fetchTasks();
    };

    const handleEdit = (task) => {
        setEditingTask(task);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-white">Task List</h1>
                <TaskForm task={editingTask} onSave={handleSave}/>
                <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={fetchTasks}/>
            </div>
        </div>
    );
};

export default Home;
