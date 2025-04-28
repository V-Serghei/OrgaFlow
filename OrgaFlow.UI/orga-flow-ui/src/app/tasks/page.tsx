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
            const response = await api.get("/", {
                params: {
                    sortBy: sortBy, // Send the sort strategy to the backend
                    notificationsEnabled: statusFilter === 'completed' ? true : undefined
                }
            })
            setTasks(response.data)

            // Since data comes pre-sorted, we only need to apply local filtering
            setFilteredTasks(filterTasksRecursively(response.data, searchTerm, statusFilter))
        } catch (error) {
            console.error("Error loading tasks:", error)
        } finally {
            setIsLoading(false)
        }
    }

// Update useEffect to fetch tasks when sortBy changes
    useEffect(() => {
        fetchTasks()
    }, [sortBy]) // Add sortBy to the dependency array

// Remove the sortTasksRecursively function call from the filtering useEffect
    useEffect(() => {
        // Only apply filtering with preservation of hierarchy
        if (tasks.length > 0) {
            const filteredResults = filterTasksRecursively(tasks, searchTerm, statusFilter)
            setFilteredTasks(filteredResults)
        } else {
            setFilteredTasks([])
        }
    }, [tasks, searchTerm, statusFilter]) // Remove sortBy from here

    // Рекурсивная функция для подсчета всех задач (включая вложенные)
    const countAllTasks = (taskList) => {
        let count = taskList.length

        taskList.forEach(task => {
            if (task.children && task.children.length > 0) {
                count += countAllTasks(task.children)
            }
        })

        return count
    }

    // Рекурсивная функция для подсчета завершенных задач
    const countCompletedTasks = (taskList) => {
        let count = taskList.filter(task => task.status === 1).length

        taskList.forEach(task => {
            if (task.children && task.children.length > 0) {
                count += countCompletedTasks(task.children)
            }
        })

        return count
    }

    // Проверка, соответствует ли задача поисковому запросу
    const taskMatchesSearch = (task, term) => {
        if (!term) return true

        const lowercaseTerm = term.toLowerCase()

        return (
            task.name.toLowerCase().includes(lowercaseTerm) ||
            (task.description && task.description.toLowerCase().includes(lowercaseTerm))
        )
    }

    // Проверка, соответствует ли задача фильтру статуса
    const taskMatchesStatusFilter = (task, filter) => {
        if (filter === "all") return true
        if (filter === "completed") return task.status === 1
        if (filter === "active") return task.status === 0
        return true
    }

    // Рекурсивная функция для фильтрации с сохранением структуры дерева
    const filterTasksRecursively = (taskList, searchTerm, statusFilter) => {
        return taskList
            .map(task => {
                // Проверка на совпадение для текущей задачи
                const currentTaskMatches =
                    taskMatchesSearch(task, searchTerm) &&
                    taskMatchesStatusFilter(task, statusFilter)

                // Если у задачи есть дочерние элементы, фильтруем их рекурсивно
                let filteredChildren = []
                if (task.children && task.children.length > 0) {
                    filteredChildren = filterTasksRecursively(
                        task.children,
                        searchTerm,
                        statusFilter
                    )
                }

                // Включаем задачу, если она совпадает с критериями поиска
                // ИЛИ если у неё есть подходящие дочерние задачи
                if (currentTaskMatches || filteredChildren.length > 0) {
                    return {
                        ...task,
                        children: filteredChildren
                    }
                }

                // Задача не подходит по критериям фильтрации
                return null
            })
            .filter(Boolean) // Удаляем null элементы из результата
    }

    // Рекурсивная сортировка с сохранением структуры дерева
    const sortTasksRecursively = (taskList, sortType) => {
        const sortedTasks = [...taskList].sort((a, b) => {
            switch (sortType) {
                case "newest":
                    return new Date(b.startDate || 0) - new Date(a.startDate || 0)
                case "oldest":
                    return new Date(a.startDate || 0) - new Date(b.startDate || 0)
                case "name-asc":
                    return a.name.localeCompare(b.name)
                case "name-desc":
                    return b.name.localeCompare(a.name)
                case "due-soon":
                    const aDate = a.endDate ? new Date(a.endDate) : new Date(9999, 11, 31)
                    const bDate = b.endDate ? new Date(b.endDate) : new Date(9999, 11, 31)
                    return aDate - bDate
                case "importance":
                    return b.importance - a.importance
                default:
                    return 0
            }
        })

        // Рекурсивно сортируем дочерние элементы
        return sortedTasks.map(task => ({
            ...task,
            children: task.children && task.children.length > 0
                ? sortTasksRecursively(task.children, sortType)
                : []
        }))
    }

    useEffect(() => {
        // Применяем фильтрацию и сортировку с сохранением иерархии
        if (tasks.length > 0) {
            const filteredResults = filterTasksRecursively(tasks, searchTerm, statusFilter)
            const sortedResults = sortTasksRecursively(filteredResults, sortBy)
            setFilteredTasks(sortedResults)
        } else {
            setFilteredTasks([])
        }
    }, [tasks, searchTerm, statusFilter, sortBy])

    const handleSave = () => {
        setEditingTask(null)
        fetchTasks()
    }

    const handleEdit = (task) => {
        setEditingTask(task)
    }

    // Подсчет задач с учетом вложенности
    const totalTaskCount = countAllTasks(tasks)
    const completedCount = countCompletedTasks(tasks)
    const activeCount = totalTaskCount - completedCount

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
                        <div className="text-2xl font-bold">{totalTaskCount}</div>
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
                        {totalTaskCount > 0 && (
                            <Badge variant="outline" className="ml-2">
                                {Math.round((completedCount / totalTaskCount) * 100)}%
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
                            <SelectItem value="importance">By Importance</SelectItem>
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
                                    <TaskForm task={editingTask} onSave={handleSave} allTasks={tasks} />
                                </div>
                            )}
                            <TaskTable
                                tasks={filteredTasks}
                                onEdit={handleEdit}
                                onDelete={fetchTasks}
                                isLoading={isLoading}
                                searchTerm={searchTerm}
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
                                        <Badge variant="outline">
                                            {filteredTasks.filter(t => t.status === 0).length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredTasks
                                            .filter(task => task.status === 0)
                                            .map(task => (
                                                <Card
                                                    key={task.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleEdit(task)}
                                                >
                                                    <CardHeader className="p-3">
                                                        <CardTitle className="text-sm">
                                                            {highlightText(task.name, searchTerm)}
                                                        </CardTitle>
                                                        {task.children && task.children.length > 0 && (
                                                            <Badge variant="secondary" className="mt-1">
                                                                {task.children.length} subtasks
                                                            </Badge>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="p-3 pt-0">
                                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                                            {highlightText(task.description || "No description", searchTerm)}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        {filteredTasks.filter(t => t.status === 0).length === 0 && (
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
                                        <Badge variant="outline">
                                            {filteredTasks.filter(t => t.status === 2).length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredTasks
                                            .filter(task => task.status === 2)
                                            .map(task => (
                                                <Card
                                                    key={task.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleEdit(task)}
                                                >
                                                    <CardHeader className="p-3">
                                                        <CardTitle className="text-sm">
                                                            {highlightText(task.name, searchTerm)}
                                                        </CardTitle>
                                                        {task.children && task.children.length > 0 && (
                                                            <Badge variant="secondary" className="mt-1">
                                                                {task.children.length} subtasks
                                                            </Badge>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="p-3 pt-0">
                                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                                            {highlightText(task.description || "No description", searchTerm)}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        {filteredTasks.filter(t => t.status === 2).length === 0 && (
                                            <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                                                <p className="text-sm text-muted-foreground">No tasks</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Completed Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Completed</h3>
                                        <Badge variant="outline">
                                            {filteredTasks.filter(t => t.status === 1).length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredTasks
                                            .filter(task => task.status === 1)
                                            .map(task => (
                                                <Card
                                                    key={task.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleEdit(task)}
                                                >
                                                    <CardHeader className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <CardTitle className="text-sm">
                                                                {highlightText(task.name, searchTerm)}
                                                            </CardTitle>
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        </div>
                                                        {task.children && task.children.length > 0 && (
                                                            <Badge variant="secondary" className="mt-1">
                                                                {task.children.length} subtasks
                                                            </Badge>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="p-3 pt-0">
                                                        <p className="line-clamp-2 text-xs text-muted-foreground">
                                                            {highlightText(task.description || "No description", searchTerm)}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        {filteredTasks.filter(t => t.status === 1).length === 0 && (
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

// Функция для выделения текста при поиске
function highlightText(text, searchTerm) {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

// Вспомогательная функция для экранирования специальных символов в регулярных выражениях
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}