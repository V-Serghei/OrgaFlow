"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarIcon, Clock, Users, MapPin, AlertCircle, Plus, X } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useParentTasks } from "@/lib/hooks/useParentTasks"
import { CommandBar } from "@/components/CommandBar"
import { useCommandInvoker } from "@/lib/hooks/useCommandInvoker"
import { TaskCommandFactory } from "@/lib/commands/TaskCommandFactory"
export default function NewTask() {
    const router = useRouter()
    const { toast } = useToast()
    const currentDate =  new Date("2023-10-01T09:00:00Z")
    const currentUser = 'V-Serghei'
    
    const { executeCommand } = useCommandInvoker();
    const commandFactory = new TaskCommandFactory();
    
    
    const { parentTasks, loading: loadingParentTasks, error: parentTasksError } = useParentTasks();
    if (parentTasksError && !toast.isActive('parent-tasks-error')) {
        toast({
            id: 'parent-tasks-error',
            title: "Ошибка загрузки",
            description: "Не удалось загрузить список доступных задач",
            variant: "destructive",
        });
    }
    
    const [task, setTask] = useState({
        name: "",
        description: "",
        type: "task", // task, meeting, deadline, presentation, personal
        priority: "medium", // low, medium, high, critical
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
        status: 0, // 0 = To Do, 1 = Completed, 2 = In Progress
        parentId: null,
        notify: false,
    })

    const availableParticipants = [
        { id: 1, name: "Serghei V.", avatar: "/avatars/serghei.png" },
        { id: 2, name: "Alex K.", avatar: "/avatars/alex.png" },
        { id: 3, name: "Maria D.", avatar: "/avatars/maria.png" },
        { id: 4, name: "John T.", avatar: "/avatars/john.png" },
        { id: 5, name: "Client Team", avatar: "/avatars/client.png" },
    ]

    const availableTags = [
        { id: 1, name: "Frontend", color: "bg-blue-100 text-blue-800" },
        { id: 2, name: "Backend", color: "bg-green-100 text-green-800" },
        { id: 3, name: "API", color: "bg-amber-100 text-amber-800" },
        { id: 4, name: "UX/UI", color: "bg-purple-100 text-purple-800" },
        { id: 5, name: "Bug", color: "bg-red-100 text-red-800" },
        { id: 6, name: "Enhancement", color: "bg-emerald-100 text-emerald-800" },
    ]

    const [newTag, setNewTag] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

    const importanceMap: Record<string, number> = {
        low: 0, medium: 1, high: 2, critical: 3
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const isoStart = task.startDate
                ? task.startDate.toISOString()
                : new Date().toISOString();

            const isoEnd = task.endDate
                ? task.endDate.toISOString()
                : isoStart;

            const taskData = {
                name: task.name,
                description: task.description,
                type: task.type,
                importance: importanceMap[task.priority] ?? 1,
                status: task.status,          
                startDate: isoStart,          
                endDate:   isoEnd,            
                startTime: task.isAllDay ? "" : task.startTime,
                endTime:   task.isAllDay ? "" : task.endTime,
                location:  task.location || "",
                isAllDay:  task.isAllDay,
                isRecurring: task.isRecurring,
                recurrencePattern: task.isRecurring
                    ? task.recurrencePattern
                    : "",
                notify:    task.notify,
                assignedTo: task.assignedTo,
                createdBy: currentUser,
                createdAt: new Date().toISOString(),
                parentId:  task.parentId,

                participants: task.participants.map(p => ({
                    id:     p.id,
                    name:   p.name,
                    avatar: p.avatar
                })),

                tags: task.tags.map(t => ({
                    id:    t.id,
                    name:  t.name,
                    color: t.color
                })),

            };

            const createCommand = commandFactory.createCreateCommand(taskData);
            const response = await executeCommand(createCommand);
            //const response = await api.post("/", taskData)

            toast({
                title: "Task Created",
                description: "Your task has been created successfully.",
            })

            router.push(`/task/${response.data.id}`)
        } catch (error) {
            console.error("Error creating task:", error)
            toast({
                title: "Creation Failed",
                description: "There was an error creating the task.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tasks
                    </Link>
                </Button>

                <CommandBar />
            </div>
            

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    {/* Main Task Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                {getTaskTypeIcon()}
                                <CardTitle>Create New {task.type.charAt(0).toUpperCase() + task.type.slice(1)}</CardTitle>
                            </div>
                            <CardDescription>
                                Fill out the details for your new {task.type}
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
                                    {task.participants.length > 0 && (
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
                                                !task.participants.some(existing => existing.id === p.id)
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
                                {task.tags.length > 0 && (
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
                                                        <SelectValue
                                                            placeholder={loadingParentTasks ? "Loading tasks..." : "Select parent task"}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="null">No parent (top-level task)</SelectItem>

                                                        {loadingParentTasks && (
                                                            <div className="flex justify-center py-2 text-sm text-muted-foreground">
                                                                Loading available tasks...
                                                            </div>
                                                        )}

                                                        {!loadingParentTasks && parentTasks.map(parentTask => (
                                                            <SelectItem key={parentTask.id} value={parentTask.id.toString()}>
                                                                <div className="flex items-center">
                                                                    {parentTask.type === 'meeting' && <Users className="h-4 w-4 mr-2 text-blue-500" />}
                                                                    {parentTask.type === 'deadline' && <AlertCircle className="h-4 w-4 mr-2 text-red-500" />}
                                                                    {parentTask.type === 'presentation' && <div className="mr-2 text-amber-500">📊</div>}
                                                                    {parentTask.type === 'personal' && <div className="mr-2 text-purple-500">🌱</div>}
                                                                    {(parentTask.type === 'task' || !parentTask.type) && <div className="mr-2 text-green-500">✓</div>}
                                                                    {parentTask.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}

                                                        {!loadingParentTasks && parentTasks.length === 0 && (
                                                            <div className="py-2 px-2 text-sm text-muted-foreground">
                                                                No active tasks available
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>

                                                {loadingParentTasks && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Загрузка доступных задач...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getTaskTypeIcon()}
                                            <span className="font-medium">
                                                {task.name || "Untitled Task"}
                                            </span>
                                        </div>
                                        <div>
                                            {task.priority && (
                                                <Badge
                                                    className={cn(
                                                        task.priority === "low" && "bg-slate-100 text-slate-800",
                                                        task.priority === "medium" && "bg-blue-100 text-blue-800",
                                                        task.priority === "high" && "bg-amber-100 text-amber-800",
                                                        task.priority === "critical" && "bg-red-100 text-red-800"
                                                    )}
                                                >
                                                    {task.priority}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {task.description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        {/* Date/Time */}
                                        {task.startDate && (
                                            <div className="flex items-center">
                                                <CalendarIcon className="mr-1 h-3 w-3" />
                                                <span>
                                                    {format(task.startDate, "MMM d")}
                                                    {task.endDate && task.endDate !== task.startDate &&
                                                        ` - ${format(task.endDate, "MMM d")}`}
                                                </span>
                                            </div>
                                        )}

                                        {/* Time */}
                                        {!task.isAllDay && task.startTime && (
                                            <div className="flex items-center">
                                                <Clock className="mr-1 h-3 w-3" />
                                                <span>
                                                    {task.startTime}
                                                    {task.endTime && ` - ${task.endTime}`}
                                                </span>
                                            </div>
                                        )}

                                        {/* Location */}
                                        {task.location && (
                                            <div className="flex items-center">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                <span>{task.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {task.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {task.tags.slice(0, 3).map(tag => (
                                                <Badge key={tag.id} className={cn("text-xs", tag.color)}>
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                            {task.tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{task.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {/* Participants */}
                                    {task.participants.length > 0 && (
                                        <div className="flex items-center mt-3 -space-x-2">
                                            {task.participants.slice(0, 3).map((participant, i) => (
                                                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                                    <AvatarImage src={participant.avatar} alt={participant.name} />
                                                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {task.participants.length > 3 && (
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                                    +{task.participants.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" onClick={() => router.push("/tasks")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Creating..." : "Create Task"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {/* ... */}
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" onClick={() => router.push("/tasks")}>
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Создание..." : "Создать задачу"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}