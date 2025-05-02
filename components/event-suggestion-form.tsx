"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useEvents } from "@/hooks/use-events"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function EventSuggestionForm() {
  const { toast } = useToast()
  const { addEvent } = useEvents()
  const [date, setDate] = useState<Date>()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data: any) => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for the event",
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
        title: "Event suggested!",
        description: "Your event has been added to the calendar.",
      })

      // Reset the form
      reset()
      setDate(undefined)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suggest event. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggest an Event</CardTitle>
        <CardDescription>Share your event idea with the group</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm font-medium">
              Event Title
            </label>
            <Input
              id="title"
              placeholder="Enter event title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="date" className="text-sm font-medium">
              Event Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Provide details about the event"
              className="min-h-[100px]"
              {...register("description")}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Suggest Event"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
