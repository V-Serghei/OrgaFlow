"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Filter, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { TaskTable } from "@/components/task-table"
import { TaskForm } from "@/components/task-form"
import api from "@/lib/api"
import Link from "next/link"

export default function TasksPage() {
    const [tasks, setTasks] = useState([])
    const [filteredTasks, setFilteredTasks] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("newest")
    const [editingTask, setEditingTask] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchTasks = async () => {
        try {
            setIsLoading(true)
            const response = await api.get("/")
            setTasks(response.data)
        } catch (error) {
            console.error("Error loading tasks:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    useEffect(() => {
        // Filter and sort tasks
        let result = [...tasks]

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (task) =>
                    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter((task) => {
                if (statusFilter === "completed") return task.completed
                if (statusFilter === "active") return !task.completed
                return true
            })
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                case "oldest":
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                case "name-asc":
                    return a.name.localeCompare(b.name)
                case "name-desc":
                    return b.name.localeCompare(a.name)
                case "due-soon":
                    const aDate = a.endDate ? new Date(a.endDate) : new Date(9999, 11, 31)
                    const bDate = b.endDate ? new Date(b.endDate) : new Date(9999, 11, 31)
                    return aDate - bDate
                default:
                    return 0
            }
        })

        setFilteredTasks(result)
    }, [tasks, searchTerm, statusFilter, sortBy])

    const handleSave = () => {
        setEditingTask(null)
        fetchTasks()
    }

    const handleEdit = (task) => {
        setEditingTask(task)
    }

    const completedCount = tasks.filter((task) => task.completed).length
    const activeCount = tasks.filter((task) => !task.completed).length

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                    <p className="text-muted-foreground">
                        Manage and organize all your tasks
                    </p>
                </div>
                <Button asChild>
                    <Link href="/tasks/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center">
                        <div className="text-2xl font-bold">{completedCount}</div>
                        {tasks.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                                {Math.round((completedCount / tasks.length) * 100)}%
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                            <SelectItem value="due-soon">Due Date</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="board">Board View</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task List</CardTitle>
                            <CardDescription>
                                View and manage all your tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {editingTask && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-lg font-medium">Edit Task</h3>
                                    <TaskForm task={editingTask} onSave={handleSave} />
                                </div>
                            )}
                            <TaskTable
                                tasks={filteredTasks}
                                onEdit={handleEdit}
                                onDelete={fetchTasks}
                                isLoading={isLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="board">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Board</CardTitle>
                            <CardDescription>
                                Kanban-style view of your tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* To Do Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">To Do</h3>
                                        <Badge variant="outline">{filteredTasks.filter(t => !t.completed).length}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredTasks
                                            .filter(task => !task.completed)
                                            .map(task => (
                                                <Card key={task.id} className="cursor-pointer hover:bg-muted/50">
                                                    <CardHeader className="p-3">
                                                        <CardTitle className="text-sm">{task.name}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-3 pt-0">
                                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                                            {task.description || "No description"}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        {filteredTasks.filter(t => !t.completed).length === 0 && (
                                            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                                                <p className="text-sm text-muted-foreground">No tasks</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* In Progress Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">In Progress</h3>
                                        <Badge variant="outline">0</Badge>
                                    </div>
                                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                                        <p className="text-sm text-muted-foreground">No tasks</p>
                                    </div>
                                </div>

                                {/* Completed Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Completed</h3>
                                        <Badge variant="outline">{filteredTasks.filter(t => t.completed).length}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredTasks
                                            .filter(task => task.completed)
                                            .map(task => (
                                                <Card key={task.id} className="cursor-pointer hover:bg-muted/50">
                                                    <CardHeader className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-sm">{task.name}</CardTitle>
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-3 pt-0">
                                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                                            {task.description || "No description"}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        {filteredTasks.filter(t => t.completed).length === 0 && (
                                            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                                                <p className="text-sm text-muted-foreground">No tasks</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
