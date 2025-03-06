import {useRouter} from 'next/router';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import '../../src/app/globals.css';

const TaskDetail = () => {
    const router = useRouter();
    const {id} = router.query;
    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    const response = await api.get(`/${id}`);
                    setTask(response.data);
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setError('Task not found');
                    } else {
                        setError('Error loading task');
                    }
                }
            };
            fetchTask();
        }
    }, [id]);

    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    if (!task) return <div className="p-6 text-center text-white">Loading...</div>;

    return (
        <div className="p-6 max-w-2xl mx-auto bg-gray-800 rounded shadow">
            <h1 className="text-2xl font-bold mb-4 break-words text-white">{task.name}</h1>
            <p className="mb-4 text-gray-300 break-words">
                {task.description || 'No description available'}
            </p>
            <p>
                <Link href="/" className="text-blue-400 hover:underline">
                    Back to list
                </Link>
            </p>
        </div>
    );
};

export default TaskDetail;
