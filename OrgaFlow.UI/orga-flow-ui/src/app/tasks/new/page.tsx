"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarIcon } from 'lucide-react'
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

export default function NewTask() {
    const router = useRouter()
    const { toast } = useToast()

    const [task, setTask] = useState({
        name: "",
        description: "",
        startDate: null,
        endDate: null,
    })

    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const taskData = {
                name: task.name,
                description: task.description,
                startDate: task.startDate ? format(task.startDate, "yyyy-MM-dd") : null,
                endDate: task.endDate ? format(task.endDate, "yyyy-MM-dd") : null,
            }

            const response = await api.post("/", taskData)

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

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tasks
                    </Link>
                </Button>
            </div>

            <Card className="mx-auto max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Create New Task</CardTitle>
                        <CardDescription>
                            Add a new task to your list
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
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => router.push("/tasks")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Creating..." : "Create Task"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
