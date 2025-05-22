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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatISO } from "date-fns"

import React from "react"

const flattenTasks = (tasks, result = []) => {
    tasks.forEach(task => {
        result.push(task);
        if (task.children && task.children.length > 0) {
            flattenTasks(task.children, result);
        }
    });
    return result;
};

export function TaskForm({ task, onSave, allTasks = [] }) {
    const [formData, setFormData] = useState({
        id: 0,
        name: "",
        description: "",
        status: 0,
        importance: 1,
        startDate: null,
        endDate: null,
        notify: false,
        parentId: null,
        children: []
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const flattenedTasks = flattenTasks(allTasks)
        .filter(t => !task || t.id !== task.id);

    useEffect(() => {
        if (task) {
            setFormData({
                id: task.id || 0,
                name: task.name || "",
                description: task.description || "",
                status: task.status || 0,
                importance: task.importance || 1,
                startDate: task.startDate ? new Date(task.startDate) : null,
                endDate: task.endDate ? new Date(task.endDate) : null,
                notify: task.notify || false,
                parentId: task.parentId,
                children: task.children || []
            })
        } else {
            setFormData({
                id: 0,
                name: "",
                description: "",
                status: 0,
                importance: 1,
                startDate: null,
                endDate: null,
                notify: false,
                parentId: null,
                children: []
            })
        }
    }, [task])

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const taskData = {
            ...formData,
            startDate: formData.startDate ? formatISO(formData.startDate) : null,
            endDate: formData.endDate ? formatISO(formData.endDate) : null,
        }

        try {
            if (task) {
                await api.put(`/${task.id}`, taskData)
            } else {
                await api.post("/", taskData)
            }
            onSave()

            if (!task) {
                setFormData({
                    id: 0,
                    name: "",
                    description: "",
                    status: 0,
                    importance: 1,
                    startDate: null,
                    endDate: null,
                    notify: false,
                    parentId: null,
                    children: []
                })
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
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status.toString()}
                        onValueChange={(value) => handleChange("status", parseInt(value))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">In Progress</SelectItem>
                            <SelectItem value="1">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="importance">Importance</Label>
                    <Select
                        value={formData.importance.toString()}
                        onValueChange={(value) => handleChange("importance", parseInt(value))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Low</SelectItem>
                            <SelectItem value="1">Medium</SelectItem>
                            <SelectItem value="2">High</SelectItem>
                            <SelectItem value="3">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.startDate}
                                onSelect={(date) => handleChange("startDate", date)}
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
                                className={cn("w-full justify-start text-left font-normal", !formData.endDate && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.endDate}
                                onSelect={(date) => handleChange("endDate", date)}
                                initialFocus
                                disabled={(date) => (formData.startDate ? date < formData.startDate : false)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="parentId">Parent Task</Label>
                <Select
                    value={formData.parentId?.toString() || "null"}
                    onValueChange={(value) => handleChange("parentId", value === "null" ? null : parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="No parent (top-level task)" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Исправлено: заменена пустая строка на "null" */}
                        <SelectItem value="null">No parent (top-level task)</SelectItem>
                        {flattenedTasks.map(t => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                                {t.name} (ID: {t.id})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="notify"
                    checked={formData.notify}
                    onCheckedChange={(checked) => handleChange("notify", checked)}
                />
                <Label htmlFor="notify">Enable notifications</Label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
        </form>
    )
}