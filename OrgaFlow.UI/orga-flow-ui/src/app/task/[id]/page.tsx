"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import Link from "next/link"

export default function TaskDetail() {
    const params = useParams()
    const router = useRouter()
    const { id } = params
    const [task, setTask] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    const response = await api.get(`/${id}`)
                    setTask(response.data)
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        setError("Task not found")
                    } else {
                        setError("Error loading task")
                    }
                } finally {
                    setLoading(false)
                }
            }
            fetchTask()
        }
    }, [id])

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

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            </div>
            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{task.name}</CardTitle>
                        <Badge variant={task.completed ? "success" : "default"}>
                            {task.completed ? "Completed" : "In Progress"}
                        </Badge>
                    </div>
                    {task.startDate && task.endDate && (
                        <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="mb-2 font-medium">Description</h3>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                            {task.description || "No description available"}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        <Clock className="mr-1 inline-block h-4 w-4" />
                        Created: {new Date(task.createdAt || Date.now()).toLocaleString()}
                    </div>
                    <Button onClick={() => router.push(`/task/${id}/edit`)}>Edit Task</Button>
                </CardFooter>
            </Card>
        </div>
    )
}


