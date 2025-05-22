"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarIcon, Clock, Users, MapPin, AlertCircle, Plus, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, formatDistanceToNow, isAfter, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCommandInvoker } from "@/lib/hooks/useCommandInvoker";
import { TaskCommandFactory } from "@/lib/commands/TaskCommandFactory";
import { CommandBar, TaskRefreshContext } from '@/components/CommandBar';

export default function EditTask() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { id } = params;
    const { executeCommand, refreshCommandState } = useCommandInvoker();

    const commandFactory = new TaskCommandFactory();
    const [loading, setLoading] = useState(true);
    const currentDate = new Date();
    const currentUser = 'V-Serghei';
    const importanceMap: Record<string, number> = {
        low: 0, medium: 1, high: 2, critical: 3
    };
    const importanceReverseMap: Record<number, string> = {
        0: 'low', 1: 'medium', 2: 'high', 3: 'critical'
    };
    const safeFormat = (dateString, formatString) => {
        try {
            if (!dateString) return "Неизвестно";

            // Отладочная информация
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
    const [task, setTask] = useState({
        id: "",
        name: "",
        description: "",
        type: "task",
        priority: "medium",
        status: 0,
        startDate: currentDate,
        endDate: null,
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        isAllDay: false,
        isRecurring: false,
        recurrencePattern: "weekly",
        participants: [],
        assignedTo: currentUser,
        tags: [],
        parentId: null,
        notify: false,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
    });

    const availableParticipants = [
        { id: 1, name: "Serghei V.", avatar: "/avatars/serghei.png" },
        { id: 2, name: "Alex K.", avatar: "/avatars/alex.png" },
        { id: 3, name: "Maria D.", avatar: "/avatars/maria.png" },
        { id: 4, name: "John T.", avatar: "/avatars/john.png" },
        { id: 5, name: "Client Team", avatar: "/avatars/client.png" },
    ];

    const availableTags = [
        { id: 1, name: "Frontend", color: "bg-blue-100 text-blue-800" },
        { id: 2, name: "Backend", color: "bg-green-100 text-green-800" },
        { id: 3, name: "API", color: "bg-amber-100 text-amber-800" },
        { id: 4, name: "UX/UI", color: "bg-purple-100 text-purple-800" },
        { id: 5, name: "Bug", color: "bg-red-100 text-red-800" },
        { id: 6, name: "Enhancement", color: "bg-emerald-100 text-emerald-800" },
        { id: 7, name: "Planning", color: "bg-indigo-100 text-indigo-800" },
        { id: 8, name: "Sprint", color: "bg-violet-100 text-violet-800" },
        { id: 9, name: "High Priority", color: "bg-orange-100 text-orange-800" },
    ];

    const [newTag, setNewTag] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    const response = await api.get(`${id}`);
                    const fetchedTask = response.data;
                    setTask({
                        ...fetchedTask,
                        priority: importanceReverseMap[fetchedTask.importance] || 'medium',
                        startDate: fetchedTask.startDate ? new Date(fetchedTask.startDate) : null,
                        endDate: fetchedTask.endDate ? new Date(fetchedTask.endDate) : null,
                    });
                } catch (error) {
                    console.error("Error fetching task:", error);
                    setError(error.response?.status === 404 ? "Task not found" : "Error loading task");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTask();
        }
    }, [id]);
   
    const refreshTaskData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`${id}`);
            const fetchedTask = response.data;
            setTask({
                ...fetchedTask,
                priority: importanceReverseMap[fetchedTask.importance] || 'medium',
                startDate: fetchedTask.startDate ? new Date(fetchedTask.startDate) : null,
                endDate: fetchedTask.endDate ? new Date(fetchedTask.endDate) : null,
            });

            // Добавляем обновление состояния команд
            refreshCommandState();
        } catch (error) {
            console.error("Error refreshing task:", error);
        } finally {
            setLoading(false);
        }
    }, [id, refreshCommandState]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Используем PascalCase для имен полей, точно как в классе TaskUpdateRequest
            const taskData = {
                Name: task.name,
                Description: task.description,
                Type: task.type,
                Importance: importanceMap[task.priority] ?? 1,
                Status: task.status,
                StartDate: task.startDate ? task.startDate.toISOString() : new Date().toISOString(),
                EndDate: task.endDate ? task.endDate.toISOString() : new Date().toISOString(),
                StartTime: task.isAllDay ? "" : task.startTime,
                EndTime: task.isAllDay ? "" : task.endTime,
                Location: task.location || "",
                IsAllDay: task.isAllDay,
                IsRecurring: task.isRecurring,
                RecurrencePattern: task.isRecurring ? task.recurrencePattern : "",
                Notify: task.notify,
                AssignedTo: task.assignedTo,
                // Важно! Именно UpdatedBy, а не updatedBy
                UpdatedBy: currentUser,
                // Важно! Именно UpdatedAt, а не updatedAt  
                UpdatedAt: new Date().toISOString(),
                ParentId: task.parentId,
                // Преобразуем массивы так же, как в рабочем коде
                Participants: task.participants?.map((p) => ({
                    Id: p.id,
                    Name: p.name,
                    Avatar: p.avatar,
                })) || [],
                Tags: task.tags?.map((t) => ({
                    Id: t.id,
                    Name: t.name,
                    Color: t.color,
                })) || [],
            };

            // Отладочная информация - закомментируйте в рабочей версии
            console.log("Sending data to server:", taskData);

            const updateCommand = commandFactory.createUpdateCommand(Number(id), taskData);
            await executeCommand(updateCommand);
            refreshCommandState();

            toast({
                title: "Задача обновлена",
                description: "Ваши изменения успешно сохранены.",
            });

            router.push(`/task/${id}`);
        } catch (error) {
            console.error("Error updating task:", error);
            // Улучшенное отображение ошибки
            let errorMessage = "Произошла ошибка при обновлении задачи.";
            if (error.response) {
                console.log("Response status:", error.response.status);
                console.log("Response data:", error.response.data);
                errorMessage += ` (${error.response.status})`;
            }

            toast({
                title: "Ошибка обновления",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddTag = () => {
        if (newTag.trim() && !task.tags.some(tag => tag.name === newTag.trim())) {
            const colors = [
                "bg-blue-100 text-blue-800",
                "bg-green-100 text-green-800",
                "bg-amber-100 text-amber-800",
                "bg-purple-100 text-purple-800",
                "bg-red-100 text-red-800",
                "bg-emerald-100 text-emerald-800",
                "bg-sky-100 text-sky-800",
                "bg-rose-100 text-rose-800",
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            setTask({
                ...task,
                tags: [...task.tags, {
                    id: Date.now(),
                    name: newTag.trim(),
                    color: randomColor
                }]
            });
            setNewTag("");
        }
    };

    const handleAddPresetTag = (tagToAdd) => {
        if (!task.tags.some(tag => tag.id === tagToAdd.id)) {
            setTask({
                ...task,
                tags: [...task.tags, tagToAdd]
            });
        }
    };

    const removeTag = (tagId) => {
        setTask({
            ...task,
            tags: task.tags.filter(tag => tag.id !== tagId)
        });
    };

    const addParticipant = (participant) => {
        if (!task.participants.some(p => p.id === participant.id)) {
            setTask({
                ...task,
                participants: [...task.participants, participant]
            });
        }
    };

    const removeParticipant = (participantId) => {
        setTask({
            ...task,
            participants: task.participants.filter(p => p.id !== participantId)
        });
    };

    const getTaskTypeIcon = () => {
        switch (task.type) {
            case 'meeting': return <Users className="h-4 w-4 text-blue-500" />;
            case 'deadline': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'presentation': return <div className="text-amber-500">📊</div>;
            case 'personal': return <div className="text-purple-500">🌱</div>;
            case 'task': default: return <div className="text-green-500">✓</div>;
        }
    };

    if (error) {
        return (
            <Card className="mx-auto max-w-2xl">
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

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                {getTaskTypeIcon()}
                                <CardTitle>Редактировать {task.type.charAt(0).toUpperCase() + task.type.slice(1)}</CardTitle>
                            </div>
                            <CardDescription>
                                Обновите детали для этой задачи
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Название</Label>
                                    <Input
                                        id="name"
                                        placeholder="Введите описательное название"
                                        value={task.name}
                                        onChange={(e) => setTask({ ...task, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Описание</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Введите детали задачи"
                                        value={task.description}
                                        onChange={(e) => setTask({ ...task, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Время и дата</h3>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="all-day"
                                        checked={task.isAllDay}
                                        onCheckedChange={(checked) => setTask({ ...task, isAllDay: checked })}
                                    />
                                    <Label htmlFor="all-day">Весь день</Label>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Дата начала</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !task.startDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {task.startDate ? safeFormat(task.createdAt, "PPP") : "Выберите дату"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={task.startDate}
                                                    onSelect={(date) => setTask({ ...task, startDate: date })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Дата окончания</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !task.endDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {task.endDate ? safeFormat(task.createdAt, "PPP"): "Выберите дату"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={task.endDate}
                                                    onSelect={(date) => setTask({ ...task, endDate: date })}
                                                    initialFocus
                                                    disabled={(date) =>
                                                        task.startDate ? date < task.startDate : false
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                {!task.isAllDay && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="startTime">Время начала</Label>
                                            <div className="flex">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 bg-muted">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <Input
                                                    id="startTime"
                                                    type="time"
                                                    value={task.startTime}
                                                    onChange={(e) => setTask({ ...task, startTime: e.target.value })}
                                                    className="rounded-l-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="endTime">Время окончания</Label>
                                            <div className="flex">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 bg-muted">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <Input
                                                    id="endTime"
                                                    type="time"
                                                    value={task.endTime}
                                                    onChange={(e) => setTask({ ...task, endTime: e.target.value })}
                                                    className="rounded-l-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="recurring"
                                        checked={task.isRecurring}
                                        onCheckedChange={(checked) => setTask({ ...task, isRecurring: checked })}
                                    />
                                    <Label htmlFor="recurring">Повторяющаяся</Label>
                                </div>
                                {task.isRecurring && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="recurrence">Повторяется</Label>
                                        <Select
                                            value={task.recurrencePattern}
                                            onValueChange={(value) => setTask({ ...task, recurrencePattern: value })}
                                        >
                                            <SelectTrigger id="recurrence">
                                                <SelectValue placeholder="Выберите шаблон повторения" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Ежедневно</SelectItem>
                                                <SelectItem value="weekly">Еженедельно</SelectItem>
                                                <SelectItem value="biweekly">Раз в две недели</SelectItem>
                                                <SelectItem value="monthly">Ежемесячно</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <Separator />
                            {(task.type === 'meeting' || task.type === 'presentation') && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Местоположение</Label>
                                        <div className="flex">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 bg-muted">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <Input
                                                id="location"
                                                placeholder="Введите местоположение или комнату для встреч"
                                                value={task.location}
                                                onChange={(e) => setTask({ ...task, location: e.target.value })}
                                                className="rounded-l-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(task.type === 'meeting' || task.type === 'presentation') && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Участники</h3>
                                    {task.participants && task.participants.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {task.participants.map(participant => (
                                                <div key={participant.id} className="flex items-center gap-1.5 bg-muted rounded-full px-2 py-1">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={participant.avatar} alt={participant.name} />
                                                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs">{participant.name}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 ml-1"
                                                        onClick={() => removeParticipant(participant.id)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Select
                                        onValueChange={(value) => {
                                            const participant = availableParticipants.find(p => p.id === parseInt(value));
                                            if (participant) addParticipant(participant);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Добавить участников" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableParticipants.filter(p =>
                                                !task.participants?.some(existing => existing.id === p.id)
                                            ).map(participant => (
                                                <SelectItem key={participant.id} value={participant.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={participant.avatar} alt={participant.name} />
                                                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{participant.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Теги</h3>
                                {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {task.tags.map(tag => (
                                            <Badge key={tag.id} className={cn("gap-1", tag.color)}>
                                                {tag.name}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 ml-1"
                                                    onClick={() => removeTag(tag.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {availableTags.filter(tag =>
                                        !task.tags.some(t => t.id === tag.id)
                                    ).map(tag => (
                                        <Badge
                                            key={tag.id}
                                            className={cn("cursor-pointer", tag.color)}
                                            onClick={() => handleAddPresetTag(tag)}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Добавить пользовательский тег"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    />
                                    <Button type="button" onClick={handleAddTag}>Добавить</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки задачи</CardTitle>
                                <CardDescription>
                                    Обновите свойства и конфигурацию
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Тип</Label>
                                    <Select
                                        value={task.type}
                                        onValueChange={(value) => setTask({ ...task, type: value })}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="task">
                                                <div className="flex items-center">
                                                    <div className="mr-2 text-green-500">✓</div>
                                                    Задача
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="meeting">
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                                                    Встреча
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="deadline">
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                                    Срок
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="presentation">
                                                <div className="flex items-center">
                                                    <div className="mr-2 text-amber-500">📊</div>
                                                    Презентация
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="personal">
                                                <div className="flex items-center">
                                                    <div className="mr-2 text-purple-500">🌱</div>
                                                    Личное
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Приоритет</Label>
                                    <Select
                                        value={task.priority}
                                        onValueChange={(value) => setTask({ ...task, priority: value })}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Выберите приоритет" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-slate-100">Низкий</Badge>
                                                    Низкий приоритет
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-blue-100">Средний</Badge>
                                                    Средний приоритет
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-amber-100">Высокий</Badge>
                                                    Высокий приоритет
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="critical">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-red-100">Критический</Badge>
                                                    Критический приоритет
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Статус</Label>
                                    <Select
                                        value={task.status.toString()}
                                        onValueChange={(value) => setTask({ ...task, status: parseInt(value) })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Выберите статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">К выполнению</SelectItem>
                                            <SelectItem value="2">В процессе</SelectItem>
                                            <SelectItem value="1">Завершено</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {task.type !== 'personal' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="assignedTo">Назначено</Label>
                                        <Select
                                            value={task.assignedTo}
                                            onValueChange={(value) => setTask({ ...task, assignedTo: value })}
                                        >
                                            <SelectTrigger id="assignedTo">
                                                <SelectValue placeholder="Назначить" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableParticipants.map(user => (
                                                    <SelectItem key={user.name} value={user.name}>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span>{user.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="notify"
                                        checked={task.notify}
                                        onCheckedChange={(checked) => setTask({ ...task, notify: checked })}
                                    />
                                    <Label htmlFor="notify">Включить уведомления</Label>
                                </div>
                                <div className="space-y-4 mt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full text-left justify-between"
                                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                    >
                                        Расширенные настройки
                                        <span className="text-xs">{showAdvancedOptions ? '▼' : '▶'}</span>
                                    </Button>
                                    {showAdvancedOptions && (
                                        <div className="space-y-4 p-4 border rounded-md mt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="parentId">Родительская задача</Label>
                                                <Select
                                                    value={task.parentId !== null ? task.parentId.toString() : "null"}
                                                    onValueChange={(value) => setTask({
                                                        ...task,
                                                        parentId: value === "null" ? null : parseInt(value)
                                                    })}
                                                >
                                                    <SelectTrigger id="parentId">
                                                        <SelectValue placeholder="Выберите родительскую задачу" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="null">Нет родителя (задача верхнего уровня)</SelectItem>
                                                        {/* Реальный запрос к API будет в useParentTasks */}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">
                                    <p>Создано: {safeFormat(task.createdAt, "PPP 'в' p")}</p>
                                    <p>Последнее обновление: {safeFormat(task.createdAt, "PPP 'в' p")}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => router.push(`/task/${id}`)}
                            >
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Сохранение..." : "Сохранить изменения"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
            </div>
        </TaskRefreshContext.Provider>
    );
}