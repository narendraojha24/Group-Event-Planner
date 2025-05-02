"use client"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useEvents } from "@/hooks/use-events"

interface EventFormProps {
  date?: Date
  onCancel: () => void
  onSuccess: () => void
}

export function EventForm({ date, onCancel, onSuccess }: EventFormProps) {
  const { toast } = useToast()
  const { addEvent } = useEvents()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const onSubmit = async (data: any) => {
    if (!date) {
      toast({
        title: "Error",
        description: "No date selected for the event",
        variant: "destructive",
      })
      return
    }

    try {
      // Add the event with the selected date
      addEvent({
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        date: date.toISOString(),
        attendees: [],
        createdBy: "Current User",
      })

      toast({
        title: "Event created!",
        description: "Your event has been added to the calendar.",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-medium">Add New Event</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="quick-title" className="text-sm font-medium">
            Event Title
          </label>
          <Input
            id="quick-title"
            placeholder="Enter event title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message as string}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="quick-description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="quick-description"
            placeholder="Provide details about the event"
            className="min-h-[80px]"
            {...register("description")}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
