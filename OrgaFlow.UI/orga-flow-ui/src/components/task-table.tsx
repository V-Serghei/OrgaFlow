"use client"


import React, { useEffect } from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, Edit, Trash2, Bell, MoreHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { apiNotify } from "@/lib/api-notify"
import Link from "next/link"
import { useToastNotify } from "@/hooks/use-toast-notify";

// Функция для подсветки текста при поиске
function highlightText(text, searchTerm) {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

// Функция для экранирования специальных символов в регулярных выражениях
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function TaskTable({ tasks, onEdit, onDelete, isLoading = false, searchTerm = "" }) {
    const [deleteId, setDeleteId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [expandedTasks, setExpandedTasks] = useState({})
    const { toastNotify } = useToastNotify();

    const handleSubscribe = async (task) => {
        try {
            await apiNotify.post("/subscribe", task)
            toastNotify("Задача успешно создана!", "success");
        } catch (error) {
            console.error("Error subscribing to notifications:", error)
            toastNotify("Произошла ошибка", "error")
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            await api.delete(`/${deleteId}`)
            toastNotify("Task Deleted", "success")
            onDelete()
        } catch (error) {
            console.error("Error deleting task:", error)
            toastNotify("Deletion Failed",
                "Could not delete the task.")
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    const toggleExpand = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }))
    }

    const getImportanceBadge = (importance) => {
        const variants = {
            0: { variant: "outline", label: "Low" },
            1: { variant: "secondary", label: "Medium" },
            2: { variant: "default", label: "High" },
            3: { variant: "destructive", label: "Critical" }
        }

        const { variant, label } = variants[importance] || variants[0]
        return <Badge variant={variant}>{label}</Badge>
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            0: { variant: "default", label: "To Do" },
            1: { variant: "success", label: "Completed" },
            2: { variant: "warning", label: "In Progress" }
        }

        const { variant, label } = statusMap[status] || statusMap[0]
        return <Badge variant={variant}>{label}</Badge>
    }

    // Возвращает цвет фона в зависимости от уровня вложенности
    const getRowBackgroundColor = (level) => {
        if (level === 0) return "";
        const colors = [
            "bg-muted/20",
            "bg-muted/30",
            "bg-muted/40",
            "bg-muted/50"
        ];
        return colors[Math.min(level - 1, colors.length - 1)];
    };

    // Автоматически раскрываем задачи, соответствующие поисковому запросу
    useEffect(() => {
        if (!searchTerm) return;

        const expandMatchingTasks = (taskList) => {
            taskList.forEach(task => {
                // Проверяем, соответствует ли текущая задача поисковому запросу
                const matches =
                    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

                // Если задача соответствует или у неё есть дочерние задачи - раскрываем её
                if (matches && task.children && task.children.length > 0) {
                    setExpandedTasks(prev => ({
                        ...prev,
                        [task.id]: true
                    }));
                }

                // Рекурсивно проверяем дочерние задачи
                if (task.children && task.children.length > 0) {
                    expandMatchingTasks(task.children);
                }
            });
        };

        expandMatchingTasks(tasks);
    }, [searchTerm, tasks]);

    // Рендер отдельной задачи с учетом вложенности
    const renderTaskRow = (task, level = 0) => {
        const hasChildren = task.children && task.children.length > 0;
        const isExpanded = expandedTasks[task.id];
        const indentWidth = level * 16; // 16px на каждый уровень вложенности

        // Вместо использования фрагментов, возвращаем массив элементов с ключами
        const rows = [];

        // Добавляем основную строку задачи с ключом
        rows.push(
            <TableRow
                key={`task-${task.id}`}
                className={`${getRowBackgroundColor(level)} hover:bg-accent/50 transition-colors relative`}
            >
                <TableCell className="font-medium p-2">
                    <div className="flex items-center">
                        {/* Визуальные индикаторы иерархии */}
                        {level > 0 && (
                            <div
                                className="absolute left-0 top-0 bottom-0 border-l-2 border-muted-foreground/20"
                                style={{ left: `${(level - 1) * 16 + 4}px`, height: '100%' }}
                            ></div>
                        )}

                        {/* Отступы для вложенности */}
                        <div style={{ width: `${indentWidth}px` }} className="flex-shrink-0"></div>

                        {/* Кнопка раскрытия/сворачивания */}
                        {hasChildren ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 mr-2 rounded-full"
                                onClick={() => toggleExpand(task.id)}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        ) : (
                            <div className="w-7"></div> // Пространство вместо кнопки для выравнивания
                        )}

                        <span>{task.id}</span>
                    </div>
                </TableCell>

                <TableCell>
                    <Link
                        href={`/task/${task.id}`}
                        className="block max-w-[200px] truncate hover:underline font-medium"
                    >
                        {searchTerm ? highlightText(task.name, searchTerm) : task.name}
                    </Link>
                </TableCell>

                <TableCell className="hidden max-w-[250px] truncate md:table-cell">
                    {searchTerm
                        ? highlightText(task.description || "No description", searchTerm)
                        : (task.description || "No description")
                    }
                </TableCell>

                <TableCell className="hidden md:table-cell">
                    <div className="flex gap-2">
                        {getStatusBadge(task.status)}
                        {getImportanceBadge(task.importance)}
                    </div>
                </TableCell>

                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/task/${task.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSubscribe(task)}>
                                <Bell className="mr-2 h-4 w-4" />
                                Notify
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(task.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        );

        // Если есть дочерние элементы и они развернуты, добавляем их в массив
        if (hasChildren && isExpanded) {
            task.children.forEach((child) => {
                const childRows = renderTaskRow(child, level + 1);
                childRows.forEach(row => rows.push(row));
            });
        }

        return rows;
    };

    const renderTasks = () => {
        if (isLoading) {
            return Array(5).fill(0).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[250px]" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[120px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-9 w-9 rounded-full ml-auto" /></TableCell>
                </TableRow>
            ));
        }

        if (!tasks.length) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                        <p className="text-sm text-muted-foreground">No tasks found</p>
                    </TableCell>
                </TableRow>
            );
        }

        // Собираем все строки в один плоский массив
        const allRows = [];
        tasks.forEach(task => {
            const taskRows = renderTaskRow(task);
            taskRows.forEach(row => allRows.push(row));
        });

        return allRows;
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderTasks()}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}