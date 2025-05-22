"use client";

import { useState, useEffect } from "react";
import { TaskTable } from "@/components/task-table";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/dashboard/overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = async () => {
        try {
            const response = await api.get("/");
            setTasks(response.data);
        } catch (error) {
            console.error("Ошибка загрузки задач:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleEdit = (task: Task) => {
        console.log("Редактирование задачи:", task);
    };

    const countTasksByStatus = (tasks: Task[], status: number): number => {
        let count = tasks.filter((task) => task.status === status).length;
        for (const task of tasks) {
            if (task.children && task.children.length) {
                count += countTasksByStatus(task.children, status);
            }
        }
        return count;
    };

    const getTotalTaskCount = (tasks: Task[]): number => {
        let count = tasks.length;
        for (const task of tasks) {
            if (task.children && task.children.length) {
                count += getTotalTaskCount(task.children);
            }
        }
        return count;
    };

    const countTasksThisMonth = (tasks: Task[]): number => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let count = tasks.filter((task) => {
            if (!task.createdAt) return false;
            const createdDate = new Date(task.createdAt);
            return (
                createdDate.getFullYear() === currentYear &&
                createdDate.getMonth() === currentMonth
            );
        }).length;

        for (const task of tasks) {
            if (task.children && task.children.length) {
                count += countTasksThisMonth(task.children);
            }
        }
        return count;
    };

    const getWeekOverWeekChange = (currentCount: number): string => {
        const previousCount = currentCount; 
        const difference = currentCount - previousCount;
        return difference >= 0 ? `+${difference} за последнюю неделю` : `${difference} за последнюю неделю`;
    };

    const totalTaskCount = getTotalTaskCount(tasks);
    const toDoCount = countTasksByStatus(tasks, 0);
    const inProgressCount = countTasksByStatus(tasks, 2);
    const completedCount = countTasksByStatus(tasks, 1);
    const tasksThisMonth = countTasksThisMonth(tasks);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Дашборд</h2>
                    <p className="text-muted-foreground">Управляйте задачами и отслеживайте прогресс</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="tasks">Задачи</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Всего задач</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalTaskCount}</div>
                                <p className="text-xs text-muted-foreground">{getWeekOverWeekChange(totalTaskCount)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">В процессе</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{inProgressCount}</div>
                                <p className="text-xs text-muted-foreground">{getWeekOverWeekChange(inProgressCount)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Завершено</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{completedCount}</div>
                                <p className="text-xs text-muted-foreground">{getWeekOverWeekChange(completedCount)}</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Обзор</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Overview
                                    toDoCount={toDoCount}
                                    inProgressCount={inProgressCount}
                                    completedCount={completedCount}
                                />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Недавняя активность</CardTitle>
                                <CardDescription>
                                    У вас было {tasksThisMonth || totalTaskCount} задач в этом месяце
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentActivity tasks={tasks} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="tasks" className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Задачи</h2>
                        </div>
                        <Button asChild>
                            <Link href="/tasks/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Новая задача
                            </Link>
                        </Button>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Список задач</CardTitle>
                            <CardDescription>Управляйте и организуйте свои задачи</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TaskTable tasks={tasks} onEdit={handleEdit} onDelete={fetchTasks} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}