"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CalendarIcon, Clock, Users, MapPin, AlertCircle, Plus, X, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function EditTask() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { id } = params

    // Текущая дата и информация о пользователе
    const currentDate = new Date('2025-04-25T13:05:16Z')
    const currentUser = 'V-Serghei'

    // Полная модель задачи со всеми доступными полями
    const [task, setTask] = useState({
        id: "",
        name: "",
        description: "",
        type: "task", // task, meeting, deadline, presentation, personal
        priority: "medium", // low, medium, high, critical
        status: 0, // 0 = To Do, 1 = Completed, 2 = In Progress
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
        notify: false
    })

    // Список возможных участников (в реальной системе это будет приходить из API)
    const availableParticipants = [
        { id: 1, name: "Serghei V.", avatar: "/avatars/serghei.png" },
        { id: 2, name: "Alex K.", avatar: "/avatars/alex.png" },
        { id: 3, name: "Maria D.", avatar: "/avatars/maria.png" },
        { id: 4, name: "John T.", avatar: "/avatars/john.png" },
        { id: 5, name: "Client Team", avatar: "/avatars/client.png" },
    ]

    // Список доступных тегов
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
    ]

    const [newTag, setNewTag] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    // В реальном приложении это был бы API-запрос:
                    // const response = await api.get(`/${id}`)

                    // Для демонстрации используем моковые данные
                    await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки API

                    // Мок данных для демонстрации
                    const mockTask = {
                        id: id,
                        name: "OrgaFlow Sprint Planning",
                        description: "Define tasks for the upcoming two-week sprint. We need to focus on the task management module and the calendar integration.",
                        type: "meeting",
                        priority: "high",
                        status: 2,
                        startDate: "2025-04-22T09:00:00Z",
                        endDate: "2025-04-22T10:30:00Z",
                        startTime: "09:00",
                        endTime: "10:30",
                        location: "Main Conference Room",
                        isAllDay: false,
                        isRecurring: true,
                        recurrencePattern: "biweekly",
                        participants: [
                            { id: 1, name: "Serghei V.", avatar: "/avatars/serghei.png" },
                            { id: 2, name: "Alex K.", avatar: "/avatars/alex.png" },
                            { id: 3, name: "Maria D.", avatar: "/avatars/maria.png" }
                        ],
                        assignedTo: "V-Serghei",
                        tags: [
                            { id: 7, name: "Planning", color: "bg-indigo-100 text-indigo-800" },
                            { id: 8, name: "Sprint", color: "bg-violet-100 text-violet-800" },
                            { id: 9, name: "High Priority", color: "bg-orange-100 text-orange-800" }
                        ],
                        parentId: null,
                        notify: true,
                        createdAt: "2025-04-18T10:00:00Z",
                        updatedAt: "2025-04-21T09:15:00Z"
                    };

                    // Parse dates to Date objects
                    setTask({
                        ...mockTask,
                        startDate: mockTask.startDate ? new Date(mockTask.startDate) : null,
                        endDate: mockTask.endDate ? new Date(mockTask.endDate) : null
                    });

                } catch (error) {
                    console.error("Error fetching task:", error);
                    if (error.response && error.response.status === 404) {
                        setError("Task not found");
                    } else {
                        setError("Error loading task");
                    }
                } finally {
                    setIsLoading(false);
                }
            };

            fetchTask();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const taskData = {
                name: task.name,
                description: task.description,
                type: task.type,
                priority: task.priority,
                status: task.status,
                startDate: task.startDate ? format(task.startDate, "yyyy-MM-dd'T'HH:mm:ss'Z'") : null,
                endDate: task.endDate ? format(task.endDate, "yyyy-MM-dd'T'HH:mm:ss'Z'") : null,
                startTime: task.isAllDay ? null : task.startTime,
                endTime: task.isAllDay ? null : task.endTime,
                location: task.location || null,
                isAllDay: task.isAllDay,
                isRecurring: task.isRecurring,
                recurrencePattern: task.isRecurring ? task.recurrencePattern : null,
                participants: task.participants,
                assignedTo: task.assignedTo,
                tags: task.tags,
                parentId: task.parentId,
                notify: task.notify,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser
            }

            // В реальном приложении это был бы API-запрос:
            // await api.put(`/${id}`, taskData)

            // Имитация API-задержки
            await new Promise(resolve => setTimeout(resolve, 1000))

            toast({
                title: "Task Updated",
                description: "Your task has been updated successfully.",
            })

            router.push(`/task/${id}`)
        } catch (error) {
            console.error("Error updating task:", error)
            toast({
                title: "Update Failed",
                description: "There was an error updating the task.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddTag = () => {
        if (newTag.trim() && !task.tags.some(tag => tag.name === newTag.trim())) {
            // Get a random color for the new tag
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

    // Render task type icon
    const getTaskTypeIcon = () => {
        switch (task.type) {
            case 'meeting':
                return <Users className="h-4 w-4 text-blue-500" />;
            case 'deadline':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'presentation':
                return <div className="text-amber-500">📊</div>;
            case 'personal':
                return <div className="text-purple-500">🌱</div>;
            case 'task':
            default:
                return <div className="text-green-500">✓</div>;
        }
    };

    if (error) {
        return (
            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <Button asChild className="mt-4">
                        <Link href="/tasks">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tasks
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/task/${id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Task
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    {/* Main Task Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                {getTaskTypeIcon()}
                                <CardTitle>Edit {task.type.charAt(0).toUpperCase() + task.type.slice(1)}</CardTitle>
                            </div>
                            <CardDescription>
                                Update the details for this {task.type}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter a descriptive name"
                                        value={task.name}
                                        onChange={(e) => setTask({ ...task, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter details about this task"
                                        value={task.description}
                                        onChange={(e) => setTask({ ...task, description: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Time and Date Settings */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Time & Date</h3>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="all-day"
                                        checked={task.isAllDay}
                                        onCheckedChange={(checked) => setTask({ ...task, isAllDay: checked })}
                                    />
                                    <Label htmlFor="all-day">All day</Label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Start Date</Label>
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
                                                    {task.startDate ? format(task.startDate, "PPP") : "Select date"}
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
                                        <Label>End Date</Label>
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
                                                    {task.endDate ? format(task.endDate, "PPP") : "Select date"}
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
                                            <Label htmlFor="startTime">Start Time</Label>
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
                                            <Label htmlFor="endTime">End Time</Label>
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
                                    <Label htmlFor="recurring">Recurring</Label>
                                </div>

                                {task.isRecurring && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="recurrence">Repeats</Label>
                                        <Select
                                            value={task.recurrencePattern}
                                            onValueChange={(value) => setTask({ ...task, recurrencePattern: value })}
                                        >
                                            <SelectTrigger id="recurrence">
                                                <SelectValue placeholder="Select recurrence pattern" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Location - only show for meetings, presentations */}
                            {(task.type === 'meeting' || task.type === 'presentation') && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <div className="flex">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-l-md border border-r-0 bg-muted">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <Input
                                                id="location"
                                                placeholder="Enter location or meeting room"
                                                value={task.location}
                                                onChange={(e) => setTask({ ...task, location: e.target.value })}
                                                className="rounded-l-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Participants - only show for meetings, presentations */}
                            {(task.type === 'meeting' || task.type === 'presentation') && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">Participants</h3>

                                    {/* Existing participants */}
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

                                    {/* Add participants dropdown */}
                                    <Select
                                        onValueChange={(value) => {
                                            const participant = availableParticipants.find(p => p.id === parseInt(value));
                                            if (participant) addParticipant(participant);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Add participants" />
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

                            {/* Tags */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">Tags</h3>

                                {/* Existing tags */}
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

                                {/* Common tags */}
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

                                {/* Add custom tag */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add custom tag"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    />
                                    <Button type="button" onClick={handleAddTag}>Add</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task Settings */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Settings</CardTitle>
                                <CardDescription>
                                    Update properties and configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Task Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={task.type}
                                        onValueChange={(value) => setTask({ ...task, type: value })}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="task">
                                                <div className="flex items-center">
                                                    <div className="mr-2 text-green-500">✓</div>
                                                    Task
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="meeting">
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                                                    Meeting
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="deadline">
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                                    Deadline
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="presentation">
                                                <div className="flex items-center">
                                                    <div className="mr-2 text-amber-500">📊</div>
                                                    Presentation
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="personal">
                                                <div className="flex items-center">
                                                    <div className="mr-2 text-purple-500">🌱</div>
                                                    Personal
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={task.priority}
                                        onValueChange={(value) => setTask({ ...task, priority: value })}
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-slate-100">Low</Badge>
                                                    Low Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-blue-100">Medium</Badge>
                                                    Medium Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-amber-100">High</Badge>
                                                    High Priority
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="critical">
                                                <div className="flex items-center">
                                                    <Badge variant="outline" className="mr-2 bg-red-100">Critical</Badge>
                                                    Critical Priority
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={task.status.toString()}
                                        onValueChange={(value) => setTask({ ...task, status: parseInt(value) })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">To Do</SelectItem>
                                            <SelectItem value="2">In Progress</SelectItem>
                                            <SelectItem value="1">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assignment */}
                                {task.type !== 'personal' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="assignedTo">Assigned To</Label>
                                        <Select
                                            value={task.assignedTo}
                                            onValueChange={(value) => setTask({ ...task, assignedTo: value })}
                                        >
                                            <SelectTrigger id="assignedTo">
                                                <SelectValue placeholder="Assign to" />
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

                                {/* Notifications */}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="notify"
                                        checked={task.notify}
                                        onCheckedChange={(checked) => setTask({ ...task, notify: checked })}
                                    />
                                    <Label htmlFor="notify">Enable notifications</Label>
                                </div>

                                {/* Advanced Options без использования Accordion */}
                                <div className="space-y-4 mt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full text-left justify-between"
                                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                    >
                                        Advanced Options
                                        <span className="text-xs">{showAdvancedOptions ? '▼' : '▶'}</span>
                                    </Button>

                                    {showAdvancedOptions && (
                                        <div className="space-y-4 p-4 border rounded-md mt-2">
                                            {/* Parent Task (Implementation needed) */}
                                            <div className="space-y-2">
                                                <Label htmlFor="parentId">Parent Task</Label>
                                                <Select
                                                    value={task.parentId !== null ? task.parentId.toString() : "null"}
                                                    onValueChange={(value) => setTask({
                                                        ...task,
                                                        parentId: value === "null" ? null : parseInt(value)
                                                    })}
                                                >
                                                    <SelectTrigger id="parentId">
                                                        <SelectValue placeholder="Select parent task" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="null">No parent (top-level task)</SelectItem>
                                                        {/* В реальной системе здесь был бы запрос к API */}
                                                        <SelectItem value="1">OrgaFlow Sprint Planning</SelectItem>
                                                        <SelectItem value="2">Authentication Module</SelectItem>
                                                        <SelectItem value="3">Client Dashboard Integration</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Last updated info */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">
                                    <p>Created: {format(new Date(task.createdAt), "PPP 'at' p")}</p>
                                    <p>Last updated: {format(new Date(task.updatedAt), "PPP 'at' p")}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => router.push(`/task/${id}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}