"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Edit, Trash2, Bell, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { apiNotify } from "@/lib/api-notify";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useCommandInvoker } from "@/lib/hooks/useCommandInvoker";
import { TaskCommandFactory } from "@/lib/commands/TaskCommandFactory";

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

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function TaskTable({ tasks, onEdit, onDelete, isLoading = false, searchTerm = "" }) {
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState({});
    const { toast } = useToast();
    const { executeCommand } = useCommandInvoker();
    const commandFactory = new TaskCommandFactory();

    const handleSubscribe = async (task) => {
        try {
            await apiNotify.post("/subscribe", task);
            toast({
                title: "Успех",
                description: "Подписка на задачу оформлена.",
            });
        } catch (error) {
            console.error("Error subscribing to notifications:", error);
            toast({
                title: "Ошибка",
                description: "Не удалось подписаться на уведомления.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            const deleteCommand = commandFactory.createDeleteCommand(Number(deleteId));
            await executeCommand(deleteCommand);

            toast({
                title: "Задача удалена",
                description: "Задача успешно удалена.",
            });

            onDelete();
        } catch (error) {
            console.error("Error deleting task:", error);
            toast({
                title: "Ошибка удаления",
                description: "Не удалось удалить задачу.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const toggleExpand = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const getImportanceBadge = (importance) => {
        const variants = {
            0: { variant: "outline", label: "Низкий" },
            1: { variant: "secondary", label: "Средний" },
            2: { variant: "default", label: "Высокий" },
            3: { variant: "destructive", label: "Критический" }
        };
        const { variant, label } = variants[importance] || variants[0];
        return <Badge variant={variant}>{label}</Badge>;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            0: { variant: "default", label: "К выполнению" },
            1: { variant: "success", label: "Завершено" },
            2: { variant: "warning", label: "В процессе" }
        };
        const { variant, label } = statusMap[status] || statusMap[0];
        return <Badge variant={variant}>{label}</Badge>;
    };

    const getRowBackgroundColor = (level) => {
        if (level === 0) return "";
        const colors = ["bg-muted/20", "bg-muted/30", "bg-muted/40", "bg-muted/50"];
        return colors[Math.min(level - 1, colors.length - 1)];
    };

    useEffect(() => {
        if (!searchTerm) return;
        const expandMatchingTasks = (taskList) => {
            taskList.forEach(task => {
                const matches =
                    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
                if (matches && task.children && task.children.length > 0) {
                    setExpandedTasks(prev => ({
                        ...prev,
                        [task.id]: true
                    }));
                }
                if (task.children && task.children.length > 0) {
                    expandMatchingTasks(task.children);
                }
            });
        };
        expandMatchingTasks(tasks);
    }, [searchTerm, tasks]);

    const renderTaskRow = (task, level = 0) => {
        const hasChildren = task.children && task.children.length > 0;
        const isExpanded = expandedTasks[task.id];
        const indentWidth = level * 16;
        const rows = [];

        rows.push(
            <TableRow
                key={`task-${task.id}`}
                className={`${getRowBackgroundColor(level)} hover:bg-accent/50 transition-colors relative`}
            >
                <TableCell className="font-medium p-2">
                    <div className="flex items-center">
                        {level > 0 && (
                            <div
                                className="absolute left-0 top-0 bottom-0 border-l-2 border-muted-foreground/20"
                                style={{ left: `${(level - 1) * 16 + 4}px`, height: '100%' }}
                            ></div>
                        )}
                        <div style={{ width: `${indentWidth}px` }} className="flex-shrink-0"></div>
                        {hasChildren ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 mr-2 rounded-full"
                                onClick={() => toggleExpand(task.id)}
                            >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        ) : (
                            <div className="w-7"></div>
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
                        ? highlightText(task.description || "Описание отсутствует", searchTerm)
                        : (task.description || "Описание отсутствует")
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
                                <span className="sr-only">Открыть меню</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/task/${task.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Просмотр
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(task)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSubscribe(task)}>
                                <Bell className="mr-2 h-4 w-4" />
                                Подписаться
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteId(task.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        );

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
                        <p className="text-sm text-muted-foreground">Задачи не найдены</p>
                    </TableCell>
                </TableRow>
            );
        }

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
                            <TableHead>Название</TableHead>
                            <TableHead className="hidden md:table-cell">Описание</TableHead>
                            <TableHead className="hidden md:table-cell">Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
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
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие удалит задачу. Вы можете отменить это действие с помощью кнопки "Отменить".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}