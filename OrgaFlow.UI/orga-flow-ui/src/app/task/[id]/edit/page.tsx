"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import Link from "next/link"

export default function EditTask() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const { id } = params

    const [task, setTask] = useState({
        id: "",
        name: "",
        description: "",
        startDate: null,
        endDate: null,
        completed: false,
    })

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    const response = await api.get(`/${id}`)
                    const taskData = response.data

                    setTask({
                        id: taskData.id,
                        name: taskData.name || "",
                        description: taskData.description || "",
                        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
                        endDate: taskData.endDate ? new Date(taskData.endDate) : null,
                        completed: taskData.completed || false,
                    })
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setError("Task not found")
                    } else {
                        setError("Error loading task")
                    }
                } finally {
                    setIsLoading(false)
                }
            }
            fetchTask()
        }
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const taskData = {
                name: task.name,
                description: task.description,
                startDate: task.startDate ? format(task.startDate, "yyyy-MM-dd") : null,
                endDate: task.endDate ? format(task.endDate, "yyyy-MM-dd") : null,
                completed: task.completed,
            }

            await api.put(`/${id}`, taskData)

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

    if (error) {
        return (
            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <Button asChild className="mt-4">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/task/${id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Task
                    </Link>
                </Button>
            </div>

            <Card className="mx-auto max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Edit Task</CardTitle>
                        <CardDescription>
                            Update the details of your task
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Task Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter task name"
                                value={task.name}
                                onChange={(e) => setTask({ ...task, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter task description"
                                value={task.description}
                                onChange={(e) => setTask({ ...task, description: e.target.value })}
                                rows={3}
                            />
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
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="completed"
                                checked={task.completed}
                                onCheckedChange={(checked) => setTask({ ...task, completed: checked })}
                            />
                            <Label htmlFor="completed">Mark as completed</Label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => router.push(`/task/${id}`)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
