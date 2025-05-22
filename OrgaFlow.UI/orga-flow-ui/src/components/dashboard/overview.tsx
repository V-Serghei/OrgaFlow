"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/types/task";
import { isBefore, isWithinInterval, subDays } from "date-fns";

interface OverviewProps {
    toDoCount: number;
    inProgressCount: number;
    completedCount: number;
    tasks: Task[] | undefined;
}

export function Overview({ toDoCount, inProgressCount, completedCount, tasks }: OverviewProps) {
    const [sortMode, setSortMode] = useState<"count" | "name">("count");

    const flattenTasks = (tasks: Task[] | undefined): Task[] => {
        if (!tasks || !Array.isArray(tasks)) return [];
        return tasks.reduce((acc, task) => {
            const children = task.children ? flattenTasks(task.children) : [];
            return [...acc, task, ...children];
        }, [] as Task[]);
    };

    const getTotalTaskCount = (tasks: Task[] | undefined): number => {
        if (!tasks || !Array.isArray(tasks)) return 0;
        let count = tasks.length;
        for (const task of tasks) {
            if (task.children && task.children.length) {
                count += getTotalTaskCount(task.children);
            }
        }
        return count;
    };

    const overdueCount = flattenTasks(tasks).filter((task) => {
        if (!task.dueDate) return false;
        return isBefore(new Date(task.dueDate), new Date()) && task.status !== 1;
    }).length;

    const noDueDateCount = flattenTasks(tasks).filter((task) => !task.dueDate).length;

    const thisWeekCount = flattenTasks(tasks).filter((task) => {
        if (!task.createdAt) return false;
        return isWithinInterval(new Date(task.createdAt), {
            start: subDays(new Date(), 7),
            end: new Date(),
        });
    }).length;

    const data = [
        { name: "К выполнению", total: toDoCount, color: "#3B82F6" }, 
        { name: "В процессе", total: inProgressCount, color: "#EAB308" }, 
        { name: "Завершено", total: completedCount, color: "#22C55E" }, 
        { name: "Просроченные", total: overdueCount, color: "#EF4444" }, 
        { name: "Без срока", total: noDueDateCount, color: "#6B7280" }, 
        { name: "На этой неделе", total: thisWeekCount, color: "#8B5CF6" }, 
    ];

    const totalTasks = getTotalTaskCount(tasks);

    const sortedData = [...data].sort((a, b) => {
        if (sortMode === "count") {
            return b.total - a.total; 
        }
        return a.name.localeCompare(b.name); 
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Select value={sortMode} onValueChange={(value: "count" | "name") => setSortMode(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="count">По количеству</SelectItem>
                        <SelectItem value="name">По названию</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sortedData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                        contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value: number, name: string) => {
                            const percentage = totalTasks > 0 ? ((value / totalTasks) * 100).toFixed(1) : 0;
                            return [`${value} задач (${percentage}%)`, name];
                        }}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}