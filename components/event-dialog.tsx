"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/event-card"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { EventForm } from "@/components/event-form"

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  events: any[]
  date?: Date
}

export function EventDialog({ isOpen, onClose, events, date }: EventDialogProps) {
  const [showEventForm, setShowEventForm] = useState(false)

  const formattedDate = date
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    : ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{formattedDate}</DialogTitle>
        </DialogHeader>

        {events.length > 0 ? (
          <div className="space-y-4 py-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">No events scheduled for this day</div>
        )}

        {showEventForm ? (
          <EventForm
            date={date}
            onCancel={() => setShowEventForm(false)}
            onSuccess={() => {
              setShowEventForm(false)
              onClose()
            }}
          />
        ) : (
          <Button onClick={() => setShowEventForm(true)} className="mt-2 w-full" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add event for this day
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
