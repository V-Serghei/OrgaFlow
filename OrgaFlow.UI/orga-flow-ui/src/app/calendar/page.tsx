"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format, isSameDay, parseISO, addDays, subDays, addHours, differenceInDays } from "date-fns"
import { CalendarIcon, Plus, Trash2, Edit2, AlertCircle, Clock, Users } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Current date: 2025-04-25
const CURRENT_DATE = new Date(2025, 3, 25) // Note: month is 0-indexed
const USER_LOGIN = "V-Serghei"

// Generate events for a month around the current date
const generateEvents = () => {
    // Task events related to user projects
    const projectEvents = [
        {
            id: 1,
            title: "OrgaFlow Sprint Planning",
            description: "Define tasks for the upcoming two-week sprint",
            date: subDays(CURRENT_DATE, 3), // 2025-04-22
            startTime: "09:00",
            endTime: "10:30",
            type: "meeting",
            participants: [
                { name: "Serghei V.", avatar: "/avatars/serghei.png" },
                { name: "Alex K.", avatar: "/avatars/alex.png" },
                { name: "Maria D.", avatar: "/avatars/maria.png" }
            ],
            location: "Main Conference Room"
        },
        {
            id: 2,
            title: "Task Management API Development",
            description: "Implement the REST API endpoints for task management feature",
            date: new Date(CURRENT_DATE), // Current day
            startTime: "14:00",
            endTime: "17:00",
            type: "task",
            assignedTo: "V-Serghei",
            priority: "high"
        },
        {
            id: 3,
            title: "OrgaFlow v1.0 Release",
            description: "Product launch with initial feature set",
            date: addDays(CURRENT_DATE, 5), // 2025-04-30
            type: "deadline",
            priority: "critical",
            progress: 85
        },
        {
            id: 4,
            title: "Code Review: Authentication Module",
            description: "Review pull request #127 for the user authentication improvements",
            date: subDays(CURRENT_DATE, 1), // 2025-04-24
            startTime: "15:30",
            endTime: "16:30",
            type: "task",
            assignedTo: "V-Serghei",
            relatedPR: "#127"
        },
        {
            id: 5,
            title: "Client Demo: Dashboard Features",
            description: "Present new dashboard analytics to the client",
            date: addDays(CURRENT_DATE, 2), // 2025-04-27
            startTime: "11:00",
            endTime: "12:00",
            type: "presentation",
            participants: [
                { name: "Serghei V.", avatar: "/avatars/serghei.png" },
                { name: "Client Team", avatar: "/avatars/client.png" }
            ],
            location: "Virtual Meeting Room"
        },
        {
            id: 6,
            title: "Team Retrospective",
            description: "Discuss what went well and what to improve from the last sprint",
            date: addDays(CURRENT_DATE, 1), // 2025-04-26
            startTime: "13:00",
            endTime: "14:30",
            type: "meeting",
            participants: [
                { name: "Serghei V.", avatar: "/avatars/serghei.png" },
                { name: "Alex K.", avatar: "/avatars/alex.png" },
                { name: "Maria D.", avatar: "/avatars/maria.png" },
                { name: "John T.", avatar: "/avatars/john.png" }
            ],
            location: "Conference Room B"
        },
        {
            id: 7,
            title: "Deploy Performance Optimizations",
            description: "Roll out the latest performance improvements to production",
            date: new Date(CURRENT_DATE), // Current day
            startTime: "09:00",
            endTime: "11:00",
            type: "task",
            assignedTo: "V-Serghei",
            priority: "medium"
        },
        {
            id: 8,
            title: "Weekly 1:1 with Manager",
            description: "Regular check-in with team lead",
            date: addDays(CURRENT_DATE, 3), // 2025-04-28
            startTime: "10:00",
            endTime: "10:30",
            type: "meeting",
            recurring: "weekly",
            location: "Manager's Office"
        },
        {
            id: 9,
            title: "Documentation Update",
            description: "Update API documentation for the new endpoints",
            date: addDays(CURRENT_DATE, 4), // 2025-04-29
            type: "task",
            assignedTo: "V-Serghei",
            priority: "low"
        },
        {
            id: 10,
            title: "System Architecture Review",
            description: "Quarterly review of the system architecture",
            date: subDays(CURRENT_DATE, 2), // 2025-04-23
            startTime: "10:00",
            endTime: "12:00",
            type: "meeting",
            participants: [
                { name: "Serghei V.", avatar: "/avatars/serghei.png" },
                { name: "Alex K.", avatar: "/avatars/alex.png" },
                { name: "System Architect", avatar: "/avatars/architect.png" }
            ],
            location: "Conference Room A"
        },
        {
            id: 11,
            title: "Tech Talk: Modern State Management",
            description: "Internal knowledge sharing session on modern state management techniques",
            date: addDays(CURRENT_DATE, 6), // 2025-05-01
            startTime: "14:00",
            endTime: "15:00",
            type: "presentation",
            presenter: "V-Serghei",
            location: "Virtual Meeting Room"
        },
        {
            id: 12,
            title: "OrgaFlow Team Lunch",
            description: "Team building lunch at the Italian restaurant",
            date: addDays(CURRENT_DATE, 7), // 2025-05-02
            startTime: "12:00",
            endTime: "13:30",
            type: "personal",
            location: "Trattoria Mario"
        }
    ];

    return projectEvents;
};

const realEvents = generateEvents();

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(CURRENT_DATE)
    const [events, setEvents] = useState(realEvents)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [isViewEventOpen, setIsViewEventOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [newEvent, setNewEvent] = useState({
        id: 0,
        title: "",
        description: "",
        date: CURRENT_DATE,
        startTime: "09:00",
        endTime: "10:00",
        type: "task",
        assignedTo: USER_LOGIN,
        priority: "medium",
        participants: []
    })
    const { toast } = useToast()

    // Get events for the selected date
    const selectedDateEvents = events.filter(
        (event) => date && isSameDay(new Date(event.date), date)
    )

    // Function to render event badges on calendar
    const renderEventBadges = (day: Date) => {
        const dayEvents = events.filter((event) => isSameDay(new Date(event.date), day))

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
                            event.type === "task" && "bg-green-500",
                            event.type === "personal" && "bg-purple-500"
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
        const eventId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;

        const eventToAdd = {
            ...newEvent,
            id: eventId,
            date: new Date(newEvent.date)
        };

        setEvents([...events, eventToAdd]);

        toast({
            title: "Event created",
            description: `${eventToAdd.title} has been added to your calendar.`,
        });

        setIsAddEventOpen(false);
        // Reset form
        setNewEvent({
            id: 0,
            title: "",
            description: "",
            date: date || CURRENT_DATE,
            startTime: "09:00",
            endTime: "10:00",
            type: "task",
            assignedTo: USER_LOGIN,
            priority: "medium",
            participants: []
        });
    }

    const handleEditEvent = () => {
        if (!selectedEvent) return;

        const updatedEvents = events.map(event =>
            event.id === selectedEvent.id ? { ...selectedEvent } : event
        );

        setEvents(updatedEvents);

        toast({
            title: "Event updated",
            description: `Changes to "${selectedEvent.title}" have been saved.`,
        });

        setIsViewEventOpen(false);
        setIsEditMode(false);
    }

    const handleDeleteEvent = (eventId) => {
        const updatedEvents = events.filter(event => event.id !== eventId);
        setEvents(updatedEvents);

        toast({
            title: "Event deleted",
            description: "The event has been removed from your calendar.",
            variant: "destructive",
        });

        setIsViewEventOpen(false);
        setSelectedEvent(null);
    }

    const openEventDetails = (event) => {
        setSelectedEvent(event);
        setIsViewEventOpen(true);
        setIsEditMode(false);
    }

    // Get upcoming events sorted by date
    const upcomingEvents = events
        .filter((event) => new Date(event.date) >= new Date(CURRENT_DATE.setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

    // Function to format event time
    const formatEventTime = (event) => {
        if (!event.startTime) return null;
        return event.endTime
            ? `${event.startTime} - ${event.endTime}`
            : `${event.startTime}`;
    };

    // Get event type badge
    const getEventTypeBadge = (type) => {
        const typeStyles = {
            meeting: "border-blue-500 text-blue-500",
            deadline: "border-red-500 text-red-500",
            presentation: "border-amber-500 text-amber-500",
            task: "border-green-500 text-green-500",
            personal: "border-purple-500 text-purple-500"
        };

        return (
            <Badge
                variant="outline"
                className={cn("capitalize", typeStyles[type] || "")}
            >
                {type}
            </Badge>
        );
    };

    // Get priority badge if applicable
    const getPriorityBadge = (priority) => {
        if (!priority) return null;

        const priorityStyles = {
            low: "bg-slate-100 text-slate-800",
            medium: "bg-blue-100 text-blue-800",
            high: "bg-amber-100 text-amber-800",
            critical: "bg-red-100 text-red-800"
        };

        return (
            <Badge className={cn("ml-2 capitalize", priorityStyles[priority] || "")}>
                {priority}
            </Badge>
        );
    };

    // Calculate how many days until the event
    const getDaysUntil = (eventDate) => {
        const days = differenceInDays(new Date(eventDate), CURRENT_DATE);
        if (days === 0) return "Today";
        if (days === 1) return "Tomorrow";
        if (days > 1) return `In ${days} days`;
        return null;
    };

    useEffect(() => {
        // Open the add event dialog with the selected date pre-populated
        if (date) {
            setNewEvent(prev => ({
                ...prev,
                date: date
            }));
        }
    }, [date]);

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
                    <DialogContent className="sm:max-w-[500px]">
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
                                            {newEvent.date ? format(new Date(newEvent.date), "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent
                                            mode="single"
                                            selected={new Date(newEvent.date)}
                                            onSelect={(date) => setNewEvent({ ...newEvent, date: date || CURRENT_DATE })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={newEvent.startTime}
                                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endTime">End Time</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={newEvent.endTime}
                                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Event Type</Label>
                                    <Select
                                        value={newEvent.type}
                                        onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="task">Task</SelectItem>
                                            <SelectItem value="meeting">Meeting</SelectItem>
                                            <SelectItem value="deadline">Deadline</SelectItem>
                                            <SelectItem value="presentation">Presentation</SelectItem>
                                            <SelectItem value="personal">Personal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={newEvent.priority}
                                        onValueChange={(value) => setNewEvent({ ...newEvent, priority: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                    const day = props.date;

                                    if (!(day instanceof Date)) return <div />;

                                    const isSelected =
                                        date &&
                                        day.getDate() === date.getDate() &&
                                        day.getMonth() === date.getMonth() &&
                                        day.getFullYear() === date.getFullYear();

                                    const isToday =
                                        day.getDate() === CURRENT_DATE.getDate() &&
                                        day.getMonth() === CURRENT_DATE.getMonth() &&
                                        day.getFullYear() === CURRENT_DATE.getFullYear();

                                    return (
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={cn(
                                                    "w-7 h-7 flex items-center justify-center",
                                                    isSelected && "bg-primary text-primary-foreground rounded-full",
                                                    isToday && !isSelected && "border border-primary rounded-full"
                                                )}
                                            >
                                                {day.getDate()}
                                            </div>
                                            {renderEventBadges(day)}
                                        </div>
                                    );
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
                        <CardContent className="max-h-80 overflow-y-auto">
                            {selectedDateEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedDateEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "rounded-md border p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                                                event.type === "deadline" && "border-l-4 border-l-red-500"
                                            )}
                                            onClick={() => openEventDetails(event)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{event.title}</h4>
                                                {getEventTypeBadge(event.type)}
                                            </div>
                                            {event.startTime && (
                                                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    <span>{formatEventTime(event)}</span>
                                                </div>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {event.description}
                                            </p>
                                            {event.priority && (
                                                <div className="mt-2">
                                                    {getPriorityBadge(event.priority)}
                                                </div>
                                            )}
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
                            <CardDescription>Your schedule for the next days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                                        onClick={() => openEventDetails(event)}
                                    >
                                        <div
                                            className={cn(
                                                "mt-1 w-3 h-3 rounded-full flex-shrink-0",
                                                event.type === "meeting" && "bg-blue-500",
                                                event.type === "deadline" && "bg-red-500",
                                                event.type === "presentation" && "bg-amber-500",
                                                event.type === "task" && "bg-green-500",
                                                event.type === "personal" && "bg-purple-500"
                                            )}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{event.title}</p>
                                                <span className="text-xs text-muted-foreground">
                          {getDaysUntil(event.date)}
                        </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(event.date), "MMM d")}
                                                {event.startTime ? `, ${event.startTime}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {upcomingEvents.length === 0 && (
                                    <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                                        No upcoming events
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Event view/edit dialog */}
            <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle>
                                {isEditMode ? "Edit Event" : "Event Details"}
                            </DialogTitle>
                            <div className="flex gap-2">
                                {!isEditMode && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsEditMode(true)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteEvent(selectedEvent?.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedEvent && !isEditMode ? (
                        <div className="py-4">
                            <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>

                            <div className="flex items-center gap-2 mb-4">
                                {getEventTypeBadge(selectedEvent.type)}
                                {getPriorityBadge(selectedEvent.priority)}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{format(new Date(selectedEvent.date), "PPPP")}</span>
                                </div>

                                {selectedEvent.startTime && (
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>{formatEventTime(selectedEvent)}</span>
                                    </div>
                                )}

                                {selectedEvent.location && (
                                    <div className="flex items-start">
                                        <div className="mr-2 mt-0.5">📍</div>
                                        <span>{selectedEvent.location}</span>
                                    </div>
                                )}

                                {selectedEvent.description && (
                                    <div className="bg-muted/50 p-3 rounded-md">
                                        {selectedEvent.description}
                                    </div>
                                )}

                                {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Participants</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEvent.participants.map((participant, i) => (
                                                <div key={i} className="flex items-center gap-1.5 bg-muted/60 rounded-full px-2 py-0.5">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={participant.avatar} alt={participant.name} />
                                                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs">{participant.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedEvent.assignedTo && (
                                    <div className="flex items-center">
                                        <div className="mr-2">👤</div>
                                        <span>Assigned to: {selectedEvent.assignedTo}</span>
                                    </div>
                                )}

                                {selectedEvent.progress !== undefined && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">Progress</span>
                                            <span className="text-xs">{selectedEvent.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${selectedEvent.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedEvent.recurring && (
                                    <div className="flex items-center mt-2 text-sm">
                                        <div className="mr-2">🔄</div>
                                        <span>Repeating: {selectedEvent.recurring}</span>
                                    </div>
                                )}

                                {selectedEvent.relatedPR && (
                                    <div className="flex items-center mt-2">
                                        <div className="mr-2">🔗</div>
                                        <span>Related PR: {selectedEvent.relatedPR}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : selectedEvent && isEditMode ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={selectedEvent.title}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={selectedEvent.description}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(new Date(selectedEvent.date), "PPP")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent
                                            mode="single"
                                            selected={new Date(selectedEvent.date)}
                                            onSelect={(date) => date && setSelectedEvent({ ...selectedEvent, date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-startTime">Start Time</Label>
                                    <Input
                                        id="edit-startTime"
                                        type="time"
                                        value={selectedEvent.startTime || ""}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-endTime">End Time</Label>
                                    <Input
                                        id="edit-endTime"
                                        type="time"
                                        value={selectedEvent.endTime || ""}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-type">Event Type</Label>
                                    <Select
                                        value={selectedEvent.type}
                                        onValueChange={(value) => setSelectedEvent({ ...selectedEvent, type: value })}
                                    >
                                        <SelectTrigger id="edit-type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="task">Task</SelectItem>
                                            <SelectItem value="meeting">Meeting</SelectItem>
                                            <SelectItem value="deadline">Deadline</SelectItem>
                                            <SelectItem value="presentation">Presentation</SelectItem>
                                            <SelectItem value="personal">Personal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-priority">Priority</Label>
                                    <Select
                                        value={selectedEvent.priority || "medium"}
                                        onValueChange={(value) => setSelectedEvent({ ...selectedEvent, priority: value })}
                                    >
                                        <SelectTrigger id="edit-priority">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedEvent.location !== undefined && (
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input
                                        id="edit-location"
                                        value={selectedEvent.location || ""}
                                        onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    ) : null}

                    <DialogFooter>
                        {isEditMode ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
                                <Button onClick={handleEditEvent}>Save Changes</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsViewEventOpen(false)}>Close</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}