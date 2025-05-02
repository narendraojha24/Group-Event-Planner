"use client"

import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-in slide-in-from-right-full rounded-lg p-4 shadow-lg ${
            toast.variant === "destructive" ? "bg-red-600 text-white" : "bg-white text-gray-900"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && <p className="text-sm">{toast.description}</p>}
            </div>
            <button onClick={() => dismiss(toast.id)} className="rounded-full p-1 hover:bg-black/10">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
