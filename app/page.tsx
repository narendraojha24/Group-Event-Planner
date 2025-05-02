"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Inter, Poppins } from "next/font/google"
import Head from "next/head"
import {
  CalendarIcon,
  Plus,
  Check,
  X,
  Bell,
  MapPin,
  Users,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns"

// Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

// Types
type Event = {
  id: string
  title: string
  description: string
  date: string
  location: string
  createdBy: string
  attendees: string[]
  reminders: number[] // days before event
}

type User = {
  id: string
  name: string
  avatar: string
}

type AppSettings = {
  darkMode: boolean
  defaultView: "calendar" | "list"
  defaultReminderDays: number[]
  notificationsEnabled: boolean
}

// Sample users for the demo
const users: User[] = [
  { id: "user1", name: "You", avatar: "https://ui-avatars.com/api/?name=You&background=6366f1&color=fff" },
  {
    id: "user2",
    name: "Alex Smith",
    avatar: "https://ui-avatars.com/api/?name=Alex+Smith&background=22c55e&color=fff",
  },
  { id: "user3", name: "Jamie Lee", avatar: "https://ui-avatars.com/api/?name=Jamie+Lee&background=ef4444&color=fff" },
  {
    id: "user4",
    name: "Taylor Kim",
    avatar: "https://ui-avatars.com/api/?name=Taylor+Kim&background=f59e0b&color=fff",
  },
  {
    id: "user5",
    name: "Jordan Patel",
    avatar: "https://ui-avatars.com/api/?name=Jordan+Patel&background=8b5cf6&color=fff",
  },
]

// Sample events for the demo
const sampleEvents: Event[] = [
  {
    id: "event1",
    title: "Team Lunch",
    description: "Monthly team lunch at the Italian restaurant",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Pasta Palace, Downtown",
    createdBy: "user2",
    attendees: ["user1", "user2", "user3"],
    reminders: [1, 3],
  },
  {
    id: "event2",
    title: "Project Planning",
    description: "Quarterly planning session for Q3",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Conference Room A",
    createdBy: "user1",
    attendees: ["user1", "user4", "user5"],
    reminders: [1],
  },
  {
    id: "event3",
    title: "Movie Night",
    description: "Watching the new sci-fi movie at Cinema City",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Cinema City, Mall",
    createdBy: "user3",
    attendees: ["user3", "user5"],
    reminders: [2],
  },
  {
    id: "event4",
    title: "Birthday Party",
    description: "Celebrating Alex's birthday",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Rooftop Bar",
    createdBy: "user4",
    attendees: ["user1", "user2", "user3", "user4", "user5"],
    reminders: [1, 7],
  },
]

// Main App Component
export default function GroupEventPlanner() {
  // State management
  const [activeView, setActiveView] = useState<"home" | "calendar" | "events" | "settings">("home")
  const [events, setEvents] = useState<Event[]>([])
  const [currentUser, setCurrentUser] = useState<User>(users[0]) // Default to first user
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [showEventModal, setShowEventModal] = useState<boolean>(false)
  const [showEventDetailsModal, setShowEventDetailsModal] = useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    defaultView: "calendar",
    defaultReminderDays: [1, 3],
    notificationsEnabled: true,
  })
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: "success" | "error" | "info"
  }>({ show: false, message: "", type: "success" })

  // Form state
  const [eventForm, setEventForm] = useState<{
    title: string
    description: string
    date: string
    location: string
    reminders: number[]
  }>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    reminders: [1],
  })

  // Refs
  const modalRef = useRef<HTMLDivElement>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved events and settings from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("events")
    const savedSettings = localStorage.getItem("settings")

    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents))
      } catch (error) {
        console.error("Error parsing saved events:", error)
      }
    } else {
      // Use sample events if no saved events
      setEvents(sampleEvents)
    }

    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(parsedSettings)

        // Apply dark mode if saved
        if (parsedSettings.darkMode) {
          document.documentElement.classList.add("dark")
        }
      } catch (error) {
        console.error("Error parsing saved settings:", error)
      }
    }
  }, [])

  // Save events to localStorage when they change
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events))
  }, [events])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings))

    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings])

  // Close modals when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowEventModal(false)
        setShowEventDetailsModal(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Show notification
  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    // Show notification
    setNotification({ show: true, message, type })

    // Hide after 3 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }))
    }, 3000)
  }

  // Create a new event
  const createEvent = () => {
    if (!eventForm.title.trim()) {
      showNotification("Please enter an event title", "error")
      return
    }

    const newEvent: Event = {
      id: `event${Date.now()}`,
      title: eventForm.title,
      description: eventForm.description,
      date: new Date(eventForm.date).toISOString(),
      location: eventForm.location,
      createdBy: currentUser.id,
      attendees: [currentUser.id],
      reminders: eventForm.reminders,
    }

    setEvents((prevEvents) => [...prevEvents, newEvent])
    setShowEventModal(false)
    resetEventForm()
    showNotification("Event created successfully!")
  }

  // Reset event form
  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      reminders: settings.defaultReminderDays,
    })
  }

  // Toggle RSVP status for current user
  const toggleRSVP = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === eventId) {
          const isAttending = event.attendees.includes(currentUser.id)
          return {
            ...event,
            attendees: isAttending
              ? event.attendees.filter((id) => id !== currentUser.id)
              : [...event.attendees, currentUser.id],
          }
        }
        return event
      }),
    )

    const isAttending = events.find((e) => e.id === eventId)?.attendees.includes(currentUser.id)
    showNotification(
      isAttending ? "You've left the event" : "You're attending the event!",
      isAttending ? "info" : "success",
    )
  }

  // Delete an event
  const deleteEvent = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId))
      setShowEventDetailsModal(false)
      showNotification("Event deleted successfully")
    }
  }

  // Set reminder for an event
  const toggleReminder = (eventId: string, days: number) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === eventId) {
          const hasReminder = event.reminders.includes(days)
          return {
            ...event,
            reminders: hasReminder ? event.reminders.filter((d) => d !== days) : [...event.reminders, days],
          }
        }
        return event
      }),
    )
    showNotification(
      `Reminder ${events.find((e) => e.id === eventId)?.reminders.includes(days) ? "removed" : "set"} for ${days} day${days > 1 ? "s" : ""} before the event`,
    )
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.date)
      return isSameDay(eventDate, date)
    })
  }

  // Check if a date has events
  const hasEvents = (date: Date) => {
    return events.some((event) => {
      const eventDate = parseISO(event.date)
      return isSameDay(eventDate, date)
    })
  }

  // Format date
  const formatDate = (dateString: string, formatStr = "PPP"): string => {
    return format(parseISO(dateString), formatStr)
  }

  // Get user by ID
  const getUserById = (userId: string): User => {
    return users.find((user) => user.id === userId) || users[0]
  }

  // Get upcoming events
  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter((event) => parseISO(event.date) >= now)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
  }

  // Get days in current month for calendar
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Open event details modal
  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
    setShowEventDetailsModal(true)
  }

  // Get event reminders that are due
  const getDueReminders = () => {
    const now = new Date()
    const reminders: { event: Event; daysUntil: number }[] = []

    events.forEach((event) => {
      const eventDate = parseISO(event.date)
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil > 0 && event.reminders.includes(daysUntil)) {
        reminders.push({ event, daysUntil })
      }
    })

    return reminders
  }

  // Check for due reminders on component mount and show notifications
  useEffect(() => {
    const dueReminders = getDueReminders()

    if (dueReminders.length > 0 && settings.notificationsEnabled) {
      // Show only the first reminder as a notification
      const { event, daysUntil } = dueReminders[0]
      showNotification(`Reminder: "${event.title}" is in ${daysUntil} day${daysUntil > 1 ? "s" : ""}!`, "info")
    }
  }, [])

  return (
    <div
      className={`${inter.variable} ${poppins.variable} min-h-screen flex flex-col transition-colors duration-300 ${settings.darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <Head>
        <title>Group Event Planner</title>
        <meta name="description" content="Plan events together with your group" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-emerald-500 text-white"
                : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 flex items-center"
                onClick={() => setActiveView("home")}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mr-2">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-poppins font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 cursor-pointer">
                  GroupPlanner
                </span>
              </motion.div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveView("home")}
                  className={`${
                    activeView === "home"
                      ? "border-emerald-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveView("calendar")}
                  className={`${
                    activeView === "calendar"
                      ? "border-emerald-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveView("events")}
                  className={`${
                    activeView === "events"
                      ? "border-emerald-500 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Events
                </button>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <button
                onClick={() => setShowEventModal(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Event
              </button>
              <button
                onClick={() => setActiveView("settings")}
                className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                <Settings className="h-6 w-6" />
              </button>
              <img
                className="h-8 w-8 rounded-full"
                src={currentUser.avatar || "/placeholder.svg"}
                alt={currentUser.name}
              />
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {showMobileMenu ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden"
            >
              <div className="pt-2 pb-3 space-y-1">
                <button
                  onClick={() => {
                    setActiveView("home")
                    setShowMobileMenu(false)
                  }}
                  className={`${
                    activeView === "home"
                      ? "bg-emerald-50 dark:bg-emerald-900 border-emerald-500 text-emerald-700 dark:text-emerald-200"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setActiveView("calendar")
                    setShowMobileMenu(false)
                  }}
                  className={`${
                    activeView === "calendar"
                      ? "bg-emerald-50 dark:bg-emerald-900 border-emerald-500 text-emerald-700 dark:text-emerald-200"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => {
                    setActiveView("events")
                    setShowMobileMenu(false)
                  }}
                  className={`${
                    activeView === "events"
                      ? "bg-emerald-50 dark:bg-emerald-900 border-emerald-500 text-emerald-700 dark:text-emerald-200"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
                >
                  Events
                </button>
                <button
                  onClick={() => {
                    setActiveView("settings")
                    setShowMobileMenu(false)
                  }}
                  className={`${
                    activeView === "settings"
                      ? "bg-emerald-50 dark:bg-emerald-900 border-emerald-500 text-emerald-700 dark:text-emerald-200"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowEventModal(true)
                    setShowMobileMenu(false)
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-emerald-600 dark:text-emerald-400"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  New Event
                </button>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={currentUser.avatar || "/placeholder.svg"}
                      alt={currentUser.name}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{currentUser.name}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main content */}
      <main className="flex-grow">
        {/* Home View */}
        {activeView === "home" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-bold font-poppins mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                Plan Events Together
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Coordinate with your group, suggest ideas, and keep track of who's attending.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => setActiveView("calendar")}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center"
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  View Calendar
                </button>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-600 dark:border-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Event
                </button>
              </div>
            </motion.div>

            {/* Upcoming Events Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-poppins">Upcoming Events</h2>
                <button
                  onClick={() => setActiveView("events")}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getUpcomingEvents()
                  .slice(0, 3)
                  .map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                      onClick={() => openEventDetails(event)}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-1 rounded-full">
                            {event.attendees.length} {event.attendees.length === 1 ? "attendee" : "attendees"}
                          </span>
                        </div>
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <Users className="h-4 w-4 mr-2" />
                            <span>Created by {getUserById(event.createdBy).name}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRSVP(event.id)
                            }}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                              event.attendees.includes(currentUser.id)
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {event.attendees.includes(currentUser.id) ? (
                              <>
                                <Check className="h-4 w-4 inline mr-1" />
                                Attending
                              </>
                            ) : (
                              "RSVP"
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleReminder(event.id, 1)
                            }}
                            className={`p-1.5 rounded-full ${
                              event.reminders.includes(1)
                                ? "text-amber-500 dark:text-amber-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                {getUpcomingEvents().length === 0 && (
                  <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                    <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No upcoming events</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first event to get started.</p>
                    <button
                      onClick={() => setShowEventModal(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      Create Event
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-8 text-center font-poppins">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Shared Calendar</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    View all group events in one place with our interactive calendar.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-teal-600 dark:text-teal-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Suggest Events</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create and share event ideas with your group members.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">RSVP Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Keep track of who's attending with our simple RSVP system.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Calendar View */}
        {activeView === "calendar" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-poppins">Calendar</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={previousMonth}
                    className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
                  <button
                    onClick={nextMonth}
                    className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center py-2 font-medium text-sm text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {getDaysInMonth().map((day, i) => {
                  const isToday = isSameDay(day, new Date())
                  const isSelected = isSameDay(day, selectedDate)
                  const dayEvents = getEventsForDate(day)
                  const hasEventToday = hasEvents(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)

                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedDate(day)
                        if (dayEvents.length > 0) {
                          setSelectedEvent(dayEvents[0])
                          setShowEventDetailsModal(true)
                        } else if (isCurrentMonth) {
                          setEventForm({
                            ...eventForm,
                            date: format(day, "yyyy-MM-dd"),
                          })
                          setShowEventModal(true)
                        }
                      }}
                      className={`aspect-square p-1 relative cursor-pointer rounded-md ${
                        !isCurrentMonth ? "opacity-40" : ""
                      } ${
                        isToday
                          ? "bg-emerald-50 dark:bg-emerald-900/20"
                          : isSelected
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : ""
                      }`}
                    >
                      <div
                        className={`h-full w-full rounded-md p-1 ${
                          hasEventToday ? "border-2 border-emerald-500 dark:border-emerald-400" : ""
                        }`}
                      >
                        <div className="text-right text-sm">{format(day, "d")}</div>
                        {dayEvents.length > 0 && (
                          <div className="mt-1">
                            {dayEvents.slice(0, 2).map((event, index) => (
                              <div
                                key={event.id}
                                className="text-xs truncate px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 mb-0.5"
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Events View */}
        {activeView === "events" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-poppins">All Events</h2>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Event
                </button>
              </div>

              {events.length > 0 ? (
                <div className="space-y-4">
                  {events
                    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                    .map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        onClick={() => openEventDetails(event)}
                      >
                        <div className="md:flex justify-between items-start">
                          <div className="mb-4 md:mb-0">
                            <div className="flex items-center mb-2">
                              <h3 className="font-bold text-lg mr-3">{event.title}</h3>
                              <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs px-2 py-1 rounded-full">
                                {event.attendees.length} {event.attendees.length === 1 ? "attendee" : "attendees"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Users className="h-4 w-4 mr-2" />
                                <span>Created by {getUserById(event.createdBy).name}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleRSVP(event.id)
                              }}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                                event.attendees.includes(currentUser.id)
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {event.attendees.includes(currentUser.id) ? (
                                <>
                                  <Check className="h-4 w-4 inline mr-1" />
                                  Attending
                                </>
                              ) : (
                                "RSVP"
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleReminder(event.id, 1)
                              }}
                              className={`p-1.5 rounded-full ${
                                event.reminders.includes(1)
                                  ? "text-amber-500 dark:text-amber-400"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              <Bell className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No events yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first event to get started.</p>
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Create Event
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Settings View */}
        {activeView === "settings" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6 font-poppins">Settings</h2>

              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <label htmlFor="darkMode" className="font-medium">
                    Dark Mode
                  </label>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="darkMode"
                      className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                      checked={settings.darkMode}
                      onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        settings.darkMode ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${
                        settings.darkMode ? "transform translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Default View */}
                <div>
                  <label className="font-medium mb-2 block">Default View</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, defaultView: "calendar" })}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        settings.defaultView === "calendar"
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, defaultView: "list" })}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        settings.defaultView === "list"
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>

                {/* Default Reminders */}
                <div>
                  <label className="font-medium mb-2 block">Default Reminders</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5, 7].map((days) => (
                      <button
                        key={days}
                        onClick={() => {
                          const hasReminder = settings.defaultReminderDays.includes(days)
                          setSettings({
                            ...settings,
                            defaultReminderDays: hasReminder
                              ? settings.defaultReminderDays.filter((d) => d !== days)
                              : [...settings.defaultReminderDays, days],
                          })
                        }}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          settings.defaultReminderDays.includes(days)
                            ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {days} day{days > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications Toggle */}
                <div className="flex items-center justify-between">
                  <label htmlFor="notifications" className="font-medium">
                    Enable Notifications
                  </label>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="notifications"
                      className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                      checked={settings.notificationsEnabled}
                      onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        settings.notificationsEnabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${
                        settings.notificationsEnabled ? "transform translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </div>

                {/* User Selection (for demo purposes) */}
                <div>
                  <label className="font-medium mb-2 block">Switch User (Demo)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setCurrentUser(user)}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
                          currentUser.id === user.id
                            ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="h-5 w-5 rounded-full mr-2"
                        />
                        {user.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Event Modal */}
        <AnimatePresence>
          {showEventModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-poppins">Create Event</h2>
                    <button
                      onClick={() => setShowEventModal(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Event Title*
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter event title"
                      />
                    </div>

                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date*
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter location"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter event description"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reminders
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 3, 5, 7].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => {
                              const hasReminder = eventForm.reminders.includes(days)
                              setEventForm({
                                ...eventForm,
                                reminders: hasReminder
                                  ? eventForm.reminders.filter((d) => d !== days)
                                  : [...eventForm.reminders, days],
                              })
                            }}
                            className={`py-1 px-3 rounded-full text-xs font-medium ${
                              eventForm.reminders.includes(days)
                                ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {days} day{days > 1 ? "s" : ""} before
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowEventModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createEvent}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      Create Event
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Details Modal */}
        <AnimatePresence>
          {showEventDetailsModal && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-poppins">{selectedEvent.title}</h2>
                    <button
                      onClick={() => setShowEventDetailsModal(false)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <CalendarIcon className="h-5 w-5 mr-3" />
                      <span>{formatDate(selectedEvent.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Users className="h-5 w-5 mr-3" />
                      <span>Created by {getUserById(selectedEvent.createdBy).name}</span>
                    </div>
                    {selectedEvent.description && (
                      <div className="pt-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h3>
                        <p className="text-gray-600 dark:text-gray-300">{selectedEvent.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attendees ({selectedEvent.attendees.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.attendees.map((attendeeId) => {
                        const attendee = getUserById(attendeeId)
                        return (
                          <div
                            key={attendeeId}
                            className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
                          >
                            <img
                              src={attendee.avatar || "/placeholder.svg"}
                              alt={attendee.name}
                              className="h-5 w-5 rounded-full mr-2"
                            />
                            <span className="text-sm">{attendee.name}</span>
                          </div>
                        )
                      })}
                      {selectedEvent.attendees.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No attendees yet</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reminders</h3>
                    <div className="flex flex-wrap gap-2">
                      {[1, 3, 5, 7].map((days) => (
                        <button
                          key={days}
                          onClick={() => toggleReminder(selectedEvent.id, days)}
                          className={`py-1 px-3 rounded-full text-xs font-medium ${
                            selectedEvent.reminders.includes(days)
                              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {days} day{days > 1 ? "s" : ""} before
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => toggleRSVP(selectedEvent.id)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        selectedEvent.attendees.includes(currentUser.id)
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      } transition-colors duration-200`}
                    >
                      {selectedEvent.attendees.includes(currentUser.id) ? (
                        <>
                          <X className="h-4 w-4 inline mr-1" />
                          Cancel RSVP
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 inline mr-1" />
                          I'll Attend
                        </>
                      )}
                    </button>
                    {selectedEvent.createdBy === currentUser.id && (
                      <button
                        onClick={() => deleteEvent(selectedEvent.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete Event
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mr-2">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-poppins font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                  GroupPlanner
                </span>
              </div>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center md:text-right text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} GroupPlanner. All rights reserved.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:mt-0 flex justify-center md:justify-start space-x-6">
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
