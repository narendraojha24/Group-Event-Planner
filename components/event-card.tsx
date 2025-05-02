"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Bell, Calendar } from "lucide-react"
import { useEvents } from "@/hooks/use-events"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EventCardProps {
  event: any
}

export function EventCard({ event }: EventCardProps) {
  const { updateEvent } = useEvents()
  const { toast } = useToast()
  const [showReminders, setShowReminders] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)

  const eventDate = new Date(event.date)
  const formattedDate = format(eventDate, "EEE, MMM d, yyyy")

  const attendeeCount = event.attendees?.length || 0

  // Check if current user is attending
  const isAttending = event.attendees?.includes("Current User")

  const handleRSVP = (attending: boolean) => {
    let newAttendees = [...(event.attendees || [])]

    if (attending) {
      // Add current user if not already in the list
      if (!newAttendees.includes("Current User")) {
        newAttendees.push("Current User")
      }
    } else {
      // Remove current user from the list
      newAttendees = newAttendees.filter((user) => user !== "Current User")
    }

    updateEvent({
      ...event,
      attendees: newAttendees,
    })

    toast({
      title: attending ? "You're going!" : "RSVP updated",
      description: attending ? "You've been added to the attendee list" : "You've been removed from the attendee list",
    })
  }

  const handleSetReminder = () => {
    setIsReminderDialogOpen(true)
  }

  const setReminder = (days: number) => {
    toast({
      title: "Reminder set!",
      description: `You'll be reminded ${days} day${days > 1 ? "s" : ""} before the event.`,
    })
    setIsReminderDialogOpen(false)
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium">{event.title}</h3>
          <Badge variant="outline" className="ml-2">
            {attendeeCount} {attendeeCount === 1 ? "attendee" : "attendees"}
          </Badge>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="mr-1 h-4 w-4" />
          {formattedDate}
        </div>

        {event.description && <p className="text-sm text-gray-600">{event.description}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isAttending ? (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={() => handleRSVP(false)}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Cancel RSVP
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
              onClick={() => handleRSVP(true)}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              I'll attend
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={handleSetReminder}>
            <Bell className="mr-1 h-4 w-4" />
            Remind me
          </Button>
        </div>
      </div>

      <AlertDialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set Reminder</AlertDialogTitle>
            <AlertDialogDescription>When would you like to be reminded about this event?</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            <Button variant="outline" onClick={() => setReminder(1)}>
              1 day before
            </Button>
            <Button variant="outline" onClick={() => setReminder(3)}>
              3 days before
            </Button>
            <Button variant="outline" onClick={() => setReminder(5)}>
              5 days before
            </Button>
            <Button variant="outline" onClick={() => setReminder(7)}>
              1 week before
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
