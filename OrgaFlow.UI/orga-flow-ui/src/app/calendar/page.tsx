"use client"

import { useState } from "react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, isSameDay } from "date-fns"
import { CalendarIcon, Plus } from 'lucide-react'

// Mock events data
const events = [
    {
        id: 1,
        title: "Team Meeting",
        description: "Weekly team sync",
        date: new Date(2025, 2, 15),
        type: "meeting",
    },
    {
        id: 2,
        title: "Project Deadline",
        description: "Submit final deliverables",
        date: new Date(2025, 2, 20),
        type: "deadline",
    },
    {
        id: 3,
        title: "Client Presentation",
        description: "Present project progress",
        date: new Date(2025, 2, 25),
        type: "presentation",
    },
    {
        id: 4,
        title: "Code Review",
        description: "Review pull requests",
        date: new Date(2025, 3, 2),
        type: "task",
    },
]

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: new Date(),
        type: "task",
    })

    // Get events for the selected date
    const selectedDateEvents = events.filter(
        (event) => date && isSameDay(event.date, date)
    )

    // Function to render event badges on calendar
    const renderEventBadges = (day: Date) => {
        const dayEvents = events.filter((event) => isSameDay(event.date, day))

        if (dayEvents.length === 0) return null

        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {dayEvents.slice(0, 2).map((event) => (
                    <Badge
                        key={event.id}
                        variant="outline"
                        className={cn(
                            "w-1.5 h-1.5 p-0 rounded-full",
                            event.type === "meeting" && "bg-blue-500",
                            event.type === "deadline" && "bg-red-500",
                            event.type === "presentation" && "bg-amber-500",
                            event.type === "task" && "bg-green-500"
                        )}
                    />
                ))}
                {dayEvents.length > 2 && (
                    <span className="text-[0.6rem] text-muted-foreground">+{dayEvents.length - 2}</span>
                )}
            </div>
        )
    }

    const handleAddEvent = () => {
        // In a real app, you would save this to your backend
        console.log("Adding new event:", newEvent)
        setIsAddEventOpen(false)
        // Reset form
        setNewEvent({
            title: "",
            description: "",
            date: new Date(),
            type: "task",
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                    <p className="text-muted-foreground">
                        Schedule and manage your events
                    </p>
                </div>
                <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                            <DialogDescription>
                                Create a new event on your calendar
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Event title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Event description"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !newEvent.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newEvent.date ? format(newEvent.date, "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent
                                            mode="single"
                                            selected={newEvent.date}
                                            onSelect={(date) => setNewEvent({ ...newEvent, date: date || new Date() })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Event Type</Label>
                                <select
                                    id="type"
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="task">Task</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="presentation">Presentation</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddEvent}>Save Event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <Card>
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>
                            View and manage your schedule
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            showOutsideDays
                            components={{
                                DayContent: (props) => {
                                    const day = props.day

                                    if (!(day instanceof Date)) return <div /> // защита от пустых ячеек

                                    const isSelected =
                                        date &&
                                        day.getDate() === date.getDate() &&
                                        day.getMonth() === date.getMonth() &&
                                        day.getFullYear() === date.getFullYear()

                                    return (
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={cn(
                                                    "w-6 h-6 flex items-center justify-center",
                                                    isSelected && "bg-primary text-primary-foreground rounded-full"
                                                )}
                                            >
                                                {day.getDate()}
                                            </div>
                                            {renderEventBadges(day)}
                                        </div>
                                    )
                                },
                            }}
                        />

                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                            </CardTitle>
                            <CardDescription>
                                {selectedDateEvents.length} events scheduled
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedDateEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDateEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="rounded-md border p-3 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{event.title}</h4>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "capitalize",
                                                        event.type === "meeting" && "border-blue-500 text-blue-500",
                                                        event.type === "deadline" && "border-red-500 text-red-500",
                                                        event.type === "presentation" && "border-amber-500 text-amber-500",
                                                        event.type === "task" && "border-green-500 text-green-500"
                                                    )}
                                                >
                                                    {event.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {event.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground">
                                        No events scheduled for this day
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {events
                                    .filter((event) => event.date >= new Date())
                                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                                    .slice(0, 3)
                                    .map((event) => (
                                        <div key={event.id} className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    event.type === "meeting" && "bg-blue-500",
                                                    event.type === "deadline" && "bg-red-500",
                                                    event.type === "presentation" && "bg-amber-500",
                                                    event.type === "task" && "bg-green-500"
                                                )}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(event.date, "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
