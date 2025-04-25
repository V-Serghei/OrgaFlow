"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft, Calendar, Clock, Edit2, Trash2, CheckCircle, Users,
    MapPin, AlertCircle, ArrowUpRight, Repeat, Bell, Bookmark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import Link from "next/link"
import { format, formatDistanceToNow, isAfter, parseISO } from "date-fns"

export default function TaskDetail() {
    const params = useParams()
    const router = useRouter()
    const { id } = params
    const [task, setTask] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const currentDate = new Date('2025-04-25T12:57:59Z')
    const currentUser = 'V-Serghei'

    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    // In a real application, you would fetch from your API
                    // For demo purposes, let's simulate fetching a task with richer data

                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 500))

                    // This is a mock task with all the expected fields
                    // In a real app, this would come from your API: const response = await api.get(`/${id}`)
                    const mockTask = {
                        id: id,
                        name: "OrgaFlow Sprint Planning",
                        description: "Define tasks for the upcoming two-week sprint. We need to focus on the task management module and the calendar integration. Make sure to prepare user stories and acceptance criteria for all planned features.\n\nKey points to discuss:\n- Task prioritization\n- Resource allocation\n- Timeline estimation",
                        type: "meeting", // task, meeting, deadline, presentation, personal
                        priority: "high", // low, medium, high, critical
                        status: 2, // 0: To Do, 1: Completed, 2: In Progress
                        startDate: "2025-04-22T09:00:00Z",
                        endDate: "2025-04-22T10:30:00Z",
                        isAllDay: false,
                        isRecurring: true,
                        recurrencePattern: "biweekly",
                        location: "Main Conference Room",
                        participants: [
                            { id: 1, name: "Serghei V.", avatar: "/avatars/serghei.png" },
                            { id: 2, name: "Alex K.", avatar: "/avatars/alex.png" },
                            { id: 3, name: "Maria D.", avatar: "/avatars/maria.png" }
                        ],
                        assignedTo: "V-Serghei",
                        tags: [
                            { id: 1, name: "Planning", color: "bg-blue-100 text-blue-800" },
                            { id: 2, name: "Sprint", color: "bg-green-100 text-green-800" },
                            { id: 3, name: "High Priority", color: "bg-amber-100 text-amber-800" }
                        ],
                        relatedTasks: [
                            { id: 101, name: "Task Management API Development", status: 2 },
                            { id: 102, name: "Calendar Integration", status: 0 }
                        ],
                        comments: [
                            {
                                id: 1,
                                author: "Alex K.",
                                avatar: "/avatars/alex.png",
                                text: "I've prepared the sprint backlog items. Let me know if there's anything I missed.",
                                createdAt: "2025-04-20T15:30:00Z"
                            },
                            {
                                id: 2,
                                author: "V-Serghei",
                                avatar: "/avatars/serghei.png",
                                text: "Added some additional tasks related to the API authorization.",
                                createdAt: "2025-04-21T09:15:00Z"
                            }
                        ],
                        history: [
                            { action: "created", timestamp: "2025-04-18T10:00:00Z", user: "V-Serghei" },
                            { action: "updated", field: "description", timestamp: "2025-04-19T14:20:00Z", user: "V-Serghei" },
                            { action: "added participant", participant: "Maria D.", timestamp: "2025-04-20T11:35:00Z", user: "V-Serghei" }
                        ],
                        createdAt: "2025-04-18T10:00:00Z",
                        updatedAt: "2025-04-21T09:15:00Z",
                        createdBy: "V-Serghei"
                    };

                    setTask(mockTask);
                } catch (error) {
                    console.error("Error fetching task:", error);
                    if (error.response && error.response.status === 404) {
                        setError("Task not found");
                    } else {
                        setError("Error loading task");
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchTask();
        }
    }, [id]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // In a real application, this would be an API call
            // await api.delete(`/${id}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            router.push('/tasks');
        } catch (error) {
            console.error("Error deleting task:", error);
            setError("Failed to delete task");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleComplete = async () => {
        try {
            // In a real application, this would be an API call
            // await api.patch(`/${id}`, { status: task.status === 1 ? 0 : 1 });

            // For demo, just update the local state
            setTask({
                ...task,
                status: task.status === 1 ? 0 : 1
            });
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    // Helper functions for rendering
    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return "To Do";
            case 1: return "Completed";
            case 2: return "In Progress";
            default: return "Unknown";
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
            case 'meeting':
                return <Users className="h-5 w-5 text-blue-500" />;
            case 'deadline':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'presentation':
                return <div className="text-amber-500 text-lg">📊</div>;
            case 'personal':
                return <div className="text-purple-500 text-lg">🌱</div>;
            case 'task':
            default:
                return <div className="text-green-500 text-lg">✓</div>;
        }
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            low: "bg-slate-100 text-slate-800",
            medium: "bg-blue-100 text-blue-800",
            high: "bg-amber-100 text-amber-800",
            critical: "bg-red-100 text-red-800"
        };

        return (
            <Badge className={cn(styles[priority] || "")}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
        );
    };

    const formatDateTime = (dateStr, isAllDay = false) => {
        if (!dateStr) return null;

        const date = new Date(dateStr);

        if (isAllDay) {
            return format(date, "PPP");
        }

        return format(date, "PPP 'at' p");
    };

    const isOverdue = (task) => {
        if (!task.endDate) return false;
        const endDate = new Date(task.endDate);
        return isAfter(currentDate, endDate) && task.status !== 1;
    };

    const isAssignedToCurrentUser = (task) => {
        return task.assignedTo === currentUser;
    };

    if (error) {
        return (
            <Card className="mx-auto max-w-3xl">
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

    if (loading) {
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
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tasks
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant={task.status === 1 ? "outline" : "default"}
                        size="sm"
                        onClick={handleComplete}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {task.status === 1 ? "Mark Incomplete" : "Mark Complete"}
                    </Button>

                    <Button variant="outline" size="icon" onClick={() => router.push(`/task/${id}/edit`)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>

                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this task. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    {/* Main Task Card */}
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
                                        {task.isRecurring && " • Recurring"}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant={getStatusBadgeVariant(task.status)}>
                                        {getStatusLabel(task.status)}
                                    </Badge>
                                    {getPriorityBadge(task.priority)}
                                    {isOverdue(task) && (
                                        <Badge variant="destructive">Overdue</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {task.tags.map(tag => (
                                        <Badge key={tag.id} className={cn(tag.color)}>
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-medium mb-2">Description</h3>
                                <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                    {task.description || "No description available"}
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium">Start</h3>
                                    <div className="flex items-center text-sm">
                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {formatDateTime(task.startDate, task.isAllDay)}
                                    </div>
                                </div>
                                {task.endDate && (
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-medium">End</h3>
                                        <div className="flex items-center text-sm">
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {formatDateTime(task.endDate, task.isAllDay)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Recurring Pattern */}
                            {task.isRecurring && task.recurrencePattern && (
                                <div className="flex items-center">
                                    <Repeat className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Repeats {task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                                    </span>
                                </div>
                            )}

                            {/* Location */}
                            {task.location && (
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{task.location}</span>
                                </div>
                            )}

                            {/* Participants */}
                            {task.participants && task.participants.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Participants</h3>
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

                            {/* Related Tasks */}
                            {task.relatedTasks && task.relatedTasks.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Related Tasks</h3>
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
                                Assigned to: <span className="font-medium">{task.assignedTo}</span>
                                {isAssignedToCurrentUser(task) && <Badge variant="outline" className="ml-2">You</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Updated {formatDistanceToNow(new Date(task.updatedAt))} ago
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Comments Section */}
                    {task.comments && task.comments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Comments</CardTitle>
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
                                                    {formatDistanceToNow(new Date(comment.createdAt))} ago
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
                                            placeholder="Add a comment..."
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Task Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <Button className="w-full">
                                <Bell className="mr-2 h-4 w-4" />
                                Subscribe
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Bookmark className="mr-2 h-4 w-4" />
                                Save
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Task Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div className="text-muted-foreground">Created by</div>
                                <div className="font-medium">{task.createdBy}</div>

                                <div className="text-muted-foreground">Created</div>
                                <div>{format(new Date(task.createdAt), "PPP")}</div>

                                <div className="text-muted-foreground">Last updated</div>
                                <div>{format(new Date(task.updatedAt), "PPP")}</div>

                                <div className="text-muted-foreground">Status</div>
                                <div>
                                    <Badge variant={getStatusBadgeVariant(task.status)}>
                                        {getStatusLabel(task.status)}
                                    </Badge>
                                </div>

                                <div className="text-muted-foreground">Priority</div>
                                <div>{getPriorityBadge(task.priority)}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task History */}
                    {task.history && task.history.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">History</CardTitle>
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
                                                {format(new Date(event.timestamp), "PPP 'at' p")}
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
    )
}