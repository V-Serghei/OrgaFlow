"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Task } from "@/types/task";
import { format, isWithinInterval, subDays } from "date-fns";
import { ru } from "date-fns/locale";

interface RecentActivityProps {
    tasks: Task[];
}

export function RecentActivity({ tasks }: RecentActivityProps) {
    const flattenTasks = (tasks: Task[]): Task[] => {
        return tasks.reduce((acc, task) => {
            const children = task.children ? flattenTasks(task.children) : [];
            return [...acc, task, ...children];
        }, [] as Task[]);
    };

    const recentTasks = flattenTasks(tasks)
        .filter((task) => {
            if (!task.createdAt && !task.updatedAt) return false;
            const date = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt!);
            return isWithinInterval(date, {
                start: subDays(new Date(), 7),
                end: new Date(),
            });
        })
        .sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt!);
            const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt!);
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

    const fallbackTasks = recentTasks.length === 0
        ? flattenTasks(tasks)
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5)
        : [];

    const tasksToShow = recentTasks.length > 0 ? recentTasks : fallbackTasks;

    return (
        <div className="space-y-4">
            {tasksToShow.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет недавних действий</p>
            ) : (
                tasksToShow.map((task) => (
                    <div key={task.id} className="flex items-center gap-4">
                        <div className="rounded-full p-2">
                            {task.status === 1 && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {task.status === 0 && <Clock className="h-5 w-5 text-blue-500" />}
                            {task.status === 2 && <Clock className="h-5 w-5 text-yellow-500" />}
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{task.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {task.status === 1 ? "Завершена" : task.status === 0 ? "Создана" : "В процессе"}
                                {(task.createdAt || task.updatedAt) && (
                                    <>
                                        {" "}
                                        {format(
                                            task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt!),
                                            "d MMM yyyy, HH:mm",
                                            { locale: ru }
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}