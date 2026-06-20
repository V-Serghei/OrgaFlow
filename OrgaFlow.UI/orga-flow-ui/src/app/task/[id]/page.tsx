"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Calendar, Clock, Edit2, Trash2, CheckCircle, Users,
    MapPin, AlertCircle, ArrowUpRight, Repeat, Bell, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";
import { format, formatDistanceToNow, isAfter, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCommandInvoker } from "@/lib/hooks/useCommandInvoker";
import { TaskCommandFactory } from "@/lib/commands/TaskCommandFactory";
import { CommandBar, TaskRefreshContext } from '@/components/CommandBar';
import { Skeleton } from "@/components/ui/skeleton";
export default function TaskDetail() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { id } = params;
    const { executeCommand } = useCommandInvoker();
    const commandFactory = new TaskCommandFactory();

    const [task, setTask] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const currentUser = 'V-Serghei';
    const safeFormat = (dateString, formatString) => {
        try {
            if (!dateString) return "Неизвестно";

            console.log("Форматируемая дата:", dateString, typeof dateString);

            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Неизвестно";
            return format(date, formatString);
        } catch (e) {
            console.error("Error formatting date with format():", e, dateString);
            return "Неизвестно";
        }
    };
    const safeFormatDistanceToNow = (dateString) => {
        try {
            if (!dateString) return "Неизвестно";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Неизвестно";
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            console.error("Error formatting date:", e, dateString);
            return "Неизвестно";
        }
    };
    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    const response = await api.get(`${id}`);
                    setTask(response.data);
                } catch (error) {
                    console.error("Error fetching task:", error);
                    setError(error.response?.status === 404 ? "Задача не найдена" : "Ошибка загрузки задачи");
                } finally {
                    setLoading(false);
                }
            };
            fetchTask();
        }
    }, [id]);
    const refreshTaskData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`${id}`);
            setTask(response.data);
        } catch (error) {
            console.error("Error refreshing task:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const deleteCommand = commandFactory.createDeleteCommand(Number(id));
            await executeCommand(deleteCommand);

            toast({
                title: "Задача удалена",
                description: "Задача успешно удалена.",
            });

            router.push('/tasks');
        } catch (error) {
            console.error("Error deleting task:", error);
            toast({
                title: "Ошибка удаления",
                description: "Не удалось удалить задачу.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleComplete = async () => {
        try {
            const updatedTaskData = {
                Name: task.name,
                Description: task.description,
                Status: task.status === 1 ? 0 : 1, 
                Importance: task.importance,
                Type: task.type,
                StartDate: task.startDate,
                EndDate: task.endDate,
                StartTime: task.startTime,
                EndTime: task.endTime,
                Location: task.location || "",
                IsAllDay: task.isAllDay,
                IsRecurring: task.isRecurring,
                RecurrencePattern: task.recurrencePattern || "",
                Notify: task.notify,
                AssignedTo: task.assignedTo,
                UpdatedBy: currentUser, 
                UpdatedAt: new Date().toISOString(),
                ParentId: task.parentId,
                Participants: task.participants?.map(p => ({
                    Id: p.id,
                    Name: p.name,
                    Avatar: p.avatar
                })) || [],
                Tags: task.tags?.map(t => ({
                    Id: t.id,
                    Name: t.name,
                    Color: t.color
                })) || []
            };

            const updateCommand = commandFactory.createUpdateCommand(Number(id), updatedTaskData);
            await executeCommand(updateCommand);

            setTask({
                ...task,
                status: task.status === 1 ? 0 : 1
            });

            toast({
                title: task.status === 1 ? "Задача помечена как незавершённая" : "Задача завершена",
                description: "Статус задачи обновлён.",
            });
        } catch (error) {
            console.error("Error updating task status:", error);
            toast({
                title: "Ошибка обновления",
                description: "Не удалось обновить статус задачи.",
                variant: "destructive",
            });
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return "К выполнению";
            case 1: return "Завершено";
            case 2: return "В процессе";
            default: return "Неизвестно";
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 0: return "default";
            case 1: return "success";
            case 2: return "warning";
            default: return "secondary";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'meeting': return <Users className="h-5 w-5 text-blue-500" />;
            case 'deadline': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'presentation': return <div className="text-amber-500 text-lg">📊</div>;
            case 'personal': return <div className="text-purple-500 text-lg">🌱</div>;
            case 'task': default: return <div className="text-green-500 text-lg">✓</div>;
        }
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            0: "bg-slate-100 text-slate-800",
            1: "bg-blue-100 text-blue-800",
            2: "bg-amber-100 text-amber-800",
            3: "bg-red-100 text-red-800"
        };
        const labels = { 0: "Низкий", 1: "Средний", 2: "Высокий", 3: "Критический" };

        return (
            <Badge className={cn(styles[priority] || "")}>
                {labels[priority] || priority}
            </Badge>
        );
    };

    const formatDateTime = (dateStr, isAllDay = false) => {
        if (!dateStr) return "Не указано";
        return isAllDay ? safeFormat(dateStr, "PPP") : safeFormat(dateStr, "PPP 'в' p");
    };

    const isOverdue = (task) => {
        if (!task?.endDate) return false;
        const endDate = new Date(task.endDate);
        const currentDate = new Date();
        return isAfter(currentDate, endDate) && task.status !== 1;
    };

    const isAssignedToCurrentUser = (task) => {
        return task?.assignedTo === currentUser;
    };

    if (error) {
        return (
            <Card className="mx-auto max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-destructive">Ошибка</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <Button asChild className="mt-4">
                        <Link href="/tasks">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад к задачам
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (loading || !task) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }
   
    return (
        <TaskRefreshContext.Provider value={refreshTaskData}>
            <div className="space-y-6">
                
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад к задачам
                    </Link>
                </Button>
                <CommandBar />
            </div>

            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(task.type)}
                                        <CardTitle className="text-2xl break-all">
                                            {task.name}
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                                        {task.isRecurring && " • Повторяющаяся"}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant={getStatusBadgeVariant(task.status)}>
                                        {getStatusLabel(task.status)}
                                    </Badge>
                                    {getPriorityBadge(task.importance)}
                                    {isOverdue(task) && (
                                        <Badge variant="destructive">Просрочено</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {task.tags.map(tag => (
                                        <Badge key={tag.id} className={cn(tag.color)}>
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <div>
                                <h3 className="text-sm font-medium mb-2">Описание</h3>
                                <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                    {task.description || "Описание отсутствует"}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium">Начало</h3>
                                    <div className="flex items-center text-sm">
                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {formatDateTime(task.startDate, task.isAllDay)}
                                    </div>
                                </div>
                                {task.endDate && (
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-medium">Окончание</h3>
                                        <div className="flex items-center text-sm">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {formatDateTime(task.endDate, task.isAllDay)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {task.isRecurring && task.recurrencePattern && (
                                <div className="flex items-center">
                                    <Repeat className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Повторяется {task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                                    </span>
                                </div>
                            )}
                            {task.location && (
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{task.location}</span>
                                </div>
                            )}
                            {task.participants && task.participants.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Участники</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {task.participants.map(participant => (
                                            <div key={participant.id} className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={participant.avatar} alt={participant.name} />
                                                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{participant.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {task.children && task.children.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Вложенные задачи ({task.children.length})</h3>
                                    <div className="space-y-2">
                                        {task.children.map(childTask => (
                                            <div
                                                key={childTask.id}
                                                className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getStatusBadgeVariant(childTask.status)} className="h-2 w-2 p-0 rounded-full" />
                                                    <span className="text-sm">{childTask.name}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    {getPriorityBadge(childTask.importance)}
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2" asChild>
                                                        <Link href={`/task/${childTask.id}`}>
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {task.children && task.children.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium">Вложенные задачи ({task.children.length})</h3>
                                        <Button variant="link" size="sm" className="h-auto p-0" asChild>
                                            <Link href={`/tasks?parentId=${task.id}`}>
                                                Показать все
                                            </Link>
                                        </Button>
                                    </div>

                                    <div className="rounded-md border">
                                        <div className="divide-y">
                                            {task.children.map((childTask) => (
                                                <div key={childTask.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-6 w-6 items-center justify-center">
                                                            {getTypeIcon(childTask.type)}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/task/${childTask.id}`}
                                                                className="font-medium hover:underline"
                                                            >
                                                                {childTask.name}
                                                            </Link>
                                                            <div className="text-xs text-muted-foreground">
                                                                {safeFormat(childTask.endDate, "PPP")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={getStatusBadgeVariant(childTask.status)}>
                                                            {getStatusLabel(childTask.status)}
                                                        </Badge>
                                                        {getPriorityBadge(childTask.importance)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {task.relatedTasks && task.relatedTasks.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Связанные задачи</h3>
                                    <div className="space-y-2">
                                        {task.relatedTasks.map(relatedTask => (
                                            <div
                                                key={relatedTask.id}
                                                className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getStatusBadgeVariant(relatedTask.status)} className="h-2 w-2 p-0 rounded-full" />
                                                    <span className="text-sm">{relatedTask.name}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                                    <Link href={`/task/${relatedTask.id}`}>
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex justify-between py-4">
                            <div className="text-sm text-muted-foreground">
                                Назначено: <span className="font-medium">{task.assignedTo}</span>
                                {isAssignedToCurrentUser(task) && <Badge variant="outline" className="ml-2">Вы</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Обновлено {safeFormatDistanceToNow(task.updatedAt)} назад
                            </div>
                        </CardFooter>
                    </Card>
                    {task.comments && task.comments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Комментарии</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {task.comments.map(comment => (
                                    <div key={comment.id} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={comment.avatar} alt={comment.author} />
                                                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-sm">{comment.author}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {safeFormatDistanceToNow(task.updatedAt)} назад
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm pl-10">{comment.text}</p>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 mt-4">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>VS</AvatarFallback>
                                    </Avatar>
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Добавить комментарий..."
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Действия</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <Button className="w-full">
                                <Bell className="mr-2 h-4 w-4" />
                                Подписаться
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Bookmark className="mr-2 h-4 w-4" />
                                Сохранить
                            </Button>
                            <Button
                                variant={task.status === 1 ? "outline" : "default"}
                                size="sm"
                                onClick={handleComplete}
                                className="col-span-2"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {task.status === 1 ? "Пометить как незавершённое" : "Пометить как завершённое"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/task/${id}/edit`)}
                                className="col-span-2"
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Редактировать
                            </Button>
                            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="col-span-2 text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Удалить
                                    </Button>
                                </AlertDialogTrigger>
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
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Удаление..." : "Удалить"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Детали</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="text-muted-foreground">Создано</div>
                                <div>{task.createdBy}</div>
                                <div className="text-muted-foreground">Дата создания</div>
                                <div>{safeFormat(task.createdAt, "PPP")}</div>
                                <div className="text-muted-foreground">Последнее обновление</div>
                                <div>{safeFormat(task.createdAt, "PPP")}</div>
                                <div className="text-muted-foreground">Статус</div>
                                <div>
                                    <Badge variant={getStatusBadgeVariant(task.status)}>
                                        {getStatusLabel(task.status)}
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground">Приоритет</div>
                                <div>{getPriorityBadge(task.importance)}</div>
                            </div>
                        </CardContent>
                    </Card>
                    {task.history && task.history.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">История</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                                {task.history.map((event, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm">
                                        <div className="relative mt-1">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            {index !== task.history.length - 1 && (
                                                <div className="absolute left-1/2 top-2 h-full w-px -translate-x-1/2 bg-border" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {event.user}
                                                <span className="font-normal text-muted-foreground ml-1">
                                                    {event.action}
                                                    {event.field && ` ${event.field}`}
                                                    {event.participant && ` ${event.participant}`}
                                                </span>
                                            </div>
                                            <time className="text-xs text-muted-foreground">
                                                {safeFormat(event.timestamp, "PPP 'в' p")}
                                            </time>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
            </div>
        </TaskRefreshContext.Provider>
    );
}