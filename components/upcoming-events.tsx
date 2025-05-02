"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventCard } from "@/components/event-card"
import { useEvents } from "@/hooks/use-events"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function UpcomingEvents() {
  const { events } = useEvents()
  const [activeTab, setActiveTab] = useState("upcoming")

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Filter upcoming events (today and future)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingEvents = sortedEvents.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })

  // Get the next 5 upcoming events
  const nextEvents = upcomingEvents.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>Manage and RSVP to upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All Events</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {nextEvents.length > 0 ? (
              nextEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <div className="py-8 text-center text-gray-500">No upcoming events. Suggest one!</div>
            )}
          </TabsContent>
          <TabsContent value="all" className="mt-4 space-y-4">
            {events.length > 0 ? (
              sortedEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <div className="py-8 text-center text-gray-500">No events found. Create your first event!</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
