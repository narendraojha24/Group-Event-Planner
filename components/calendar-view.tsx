"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEvents } from "@/hooks/use-events"
import { EventDialog } from "@/components/event-dialog"

export function CalendarView() {
  const { events } = useEvents()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDateEvents, setSelectedDateEvents] = useState<any[]>([])

  // Function to check if a date has events
  const hasEvents = (date: Date) => {
    return events.some((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Function to handle date selection
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        )
      })

      if (filteredEvents.length > 0) {
        setSelectedDateEvents(filteredEvents)
        setIsDialogOpen(true)
      }
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Group Calendar</CardTitle>
        <CardDescription>View and plan events together</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="rounded-md border"
          components={{
            day: ({ date, ...props }) => {
              const hasEventOnDay = hasEvents(date)
              return (
                <div {...props} className={`${props.className} relative ${hasEventOnDay ? "font-bold" : ""}`}>
                  {props.children}
                  {hasEventOnDay && (
                    <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500"></div>
                  )}
                </div>
              )
            },
          }}
        />
        <div className="mt-4 flex items-center justify-end">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span>Event scheduled</span>
          </Badge>
        </div>
      </CardContent>

      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        events={selectedDateEvents}
        date={selectedDate}
      />
    </Card>
  )
}
