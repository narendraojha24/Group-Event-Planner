"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Sample initial events
const initialEvents = [
  {
    id: "1",
    title: "Team Lunch",
    description: "Monthly team lunch at the Italian restaurant",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    attendees: ["Current User", "Jane Smith", "John Doe"],
    createdBy: "Jane Smith",
  },
  {
    id: "2",
    title: "Project Planning",
    description: "Quarterly planning session for Q3",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    attendees: ["John Doe", "Alice Johnson"],
    createdBy: "John Doe",
  },
  {
    id: "3",
    title: "Movie Night",
    description: "Watching the new sci-fi movie at Cinema City",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    attendees: [],
    createdBy: "Current User",
  },
]

// Create context
const EventsContext = createContext<{
  events: any[]
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  deleteEvent: (id: string) => void
}>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
})

// Provider component
export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<any[]>([])

  // Initialize with sample data
  useEffect(() => {
    // In a real app, you would fetch from an API or local storage
    setEvents(initialEvents)
  }, [])

  const addEvent = (event: any) => {
    setEvents((prev) => [...prev, event])
  }

  const updateEvent = (updatedEvent: any) => {
    setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>{children}</EventsContext.Provider>
  )
}

// Hook for using the context
export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider")
  }
  return context
}
