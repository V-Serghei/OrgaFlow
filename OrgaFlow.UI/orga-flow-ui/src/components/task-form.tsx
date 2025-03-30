"use client"

import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

export function TaskForm({ task, onSave }) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (task) {
            setName(task.name || "")
            setDescription(task.description || "")
            setStartDate(task.startDate ? new Date(task.startDate) : null)
            setEndDate(task.endDate ? new Date(task.endDate) : null)
        } else {
            setName("")
            setDescription("")
            setStartDate(null)
            setEndDate(null)
        }
    }, [task])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const taskData = {
            name,
            description,
            startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
            endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
        }

        try {
            if (task) {
                await api.put(`/${task.id}`, taskData)
            } else {
                await api.post("/", taskData)
            }
            onSave()

            // Reset form if not editing
            if (!task) {
                setName("")
                setDescription("")
                setStartDate(null)
                setEndDate(null)
            }
        } catch (error) {
            console.error("Error saving task:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                    id="name"
                    placeholder="Enter task name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                                disabled={(date) => (startDate ? date < startDate : false)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
        </form>
    )
}

