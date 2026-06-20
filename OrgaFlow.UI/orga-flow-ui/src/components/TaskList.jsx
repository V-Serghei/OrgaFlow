"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCommandInvoker } from "@/lib/hooks/useCommandInvoker";
import { TaskCommandFactory } from "@/lib/commands/TaskCommandFactory";
import { CommandBar } from "@/components/CommandBar";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const { executeCommand } = useCommandInvoker();
    const commandFactory = new TaskCommandFactory();

    const loadTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get("/task");
            setTasks(response.data);
        } catch (error) {
            console.error("Ошибка загрузки задач:", error);
            toast({
                title: "Ошибка загрузки",
                description: "Не удалось загрузить задачи.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleEdit = (taskId) => {
        router.push(`/task/edit/${taskId}`);
    };

    const handleDelete = async (taskId) => {
        try {
            const deleteCommand = commandFactory.createDeleteCommand(taskId);
            await executeCommand(deleteCommand);

            toast({
                title: "Задача удалена",
                description: "Задача была успешно удалена.",
                variant: "default",
            });

            await loadTasks();
        } catch (error) {
            console.error("Ошибка удаления задачи:", error);
            toast({
                title: "Ошибка удаления",
                description: "Не удалось удалить задачу.",
                variant: "destructive",
            });
        }
    };

    const handleComplete = async (taskId) => {
        try {
            const taskToUpdate = tasks.find(t => t.id === taskId);
            if (!taskToUpdate) return;

            const updatedTask = {
                ...taskToUpdate,
                status: taskToUpdate.status === 1 ? 0 : 1  
            };

            const updateCommand = commandFactory.createUpdateCommand(taskId, updatedTask);
            await executeCommand(updateCommand);

            toast({
                title: updatedTask.status === 1 ? "Задача выполнена" : "Задача возобновлена",
                description: updatedTask.status === 1
                    ? "Задача отмечена как выполненная."
                    : "Задача перемещена в список к выполнению.",
                variant: "default",
            });

            // Перезагружаем список задач
            await loadTasks();
        } catch (error) {
            console.error("Ошибка обновления статуса задачи:", error);
            toast({
                title: "Ошибка обновления",
                description: "Не удалось обновить статус задачи.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div>Загрузка задач...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Список задач</h1>
                <div className="flex items-center space-x-2">
                    <CommandBar />
                    <Button onClick={() => router.push('/task/new')}>
                        Новая задача
                    </Button>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-10 bg-muted rounded-md">
                    <p>У вас пока нет задач. Создайте новую задачу, чтобы начать.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`p-4 border rounded-lg ${task.status === 1 ? 'bg-muted' : 'bg-card'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h3 className={`font-medium ${task.status === 1 ? 'line-through text-muted-foreground' : ''}`}>
                                        {task.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {task.tags?.map((tag, i) => (
                                            <span
                                                key={`${task.id}-tag-${i}`}
                                                className={`px-2 py-1 text-xs rounded-full ${tag.color || 'bg-blue-100 text-blue-800'}`}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleComplete(task.id)}
                                        title={task.status === 1 ? "Возобновить" : "Выполнить"}
                                    >
                                        <CheckCircle className={task.status === 1 ? "h-4 w-4 text-green-500" : "h-4 w-4"} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(task.id)}
                                        title="Редактировать"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(task.id)}
                                        title="Удалить"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}