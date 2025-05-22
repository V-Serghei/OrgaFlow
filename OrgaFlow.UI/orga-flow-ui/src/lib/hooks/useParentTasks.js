"use client";

import { useState, useEffect } from 'react';
import api from "@/lib/api";

export function useParentTasks() {
    const [parentTasks, setParentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParentTasks = async () => {
            setLoading(true);
            try {
                const currentUser = 'V-Serghei';

                const response = await api.get(`/user/${currentUser}`);

                if (response.data) {
                    const now = new Date();
                    const activeTasks = response.data.filter(task => {
                        const endDate = new Date(task.endDate);
                        return (
                            task.status !== 3 && task.status !== 4 &&
                            endDate >= now
                        );
                    });

                    setParentTasks(activeTasks);
                }
            } catch (err) {
                console.error("Ошибка при загрузке задач:", err);
                setError(err.message || "Не удалось загрузить список задач");
            } finally {
                setLoading(false);
            }
        };

        fetchParentTasks();
    }, []); 

    return { parentTasks, loading, error };
}