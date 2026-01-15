import { format } from "date-fns"

interface CalendarEvent {
    title: string
    description?: string
    location?: string
    startTime: string | Date
    endTime: string | Date
}

export function googleCalendarLink(event: CalendarEvent): string {
    const start = new Date(event.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "")
    const end = new Date(event.endTime).toISOString().replace(/-|:|\.\d\d\d/g, "")

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${start}/${end}`,
        details: event.description || "",
        location: event.location || "",
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function outlookCalendarLink(event: CalendarEvent): string {
    const start = new Date(event.startTime).toISOString()
    const end = new Date(event.endTime).toISOString()

    const params = new URLSearchParams({
        path: "/calendar/action/compose",
        rru: "addevent",
        startdt: start,
        enddt: end,
        subject: event.title,
        body: event.description || "",
        location: event.location || "",
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

export function icsFileContent(event: CalendarEvent): string {
    const start = new Date(event.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "")
    const end = new Date(event.endTime).toISOString().replace(/-|:|\.\d\d\d/g, "")

    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${document.location.href}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`
}

export function downloadIcs(event: CalendarEvent) {
    const content = icsFileContent(event)
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${event.title}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
