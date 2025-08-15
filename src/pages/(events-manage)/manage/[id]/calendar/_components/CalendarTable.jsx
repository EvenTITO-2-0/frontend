import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import EventDeleteDialog from './EventDeleteDialog'

export default function ResourceCalendar() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [events, setEvents] = useState([
    {
      id: '1',
      resourceId: 'a',
      title: 'Slot',
      start: '2025-08-14T10:00:00',
      end: '2025-08-14T12:00:00',
    },
    {
      id: '2',
      resourceId: 'a',
      title: 'Break',
      start: '2025-08-14T12:00:00',
      end: '2025-08-14T13:00:00',
    },
    {
      id: '3',
      resourceId: 'a',
      title: 'Plenaria',
      start: '2025-08-14T14:00:00',
      end: '2025-08-14T16:00:00',
    },
  ])

  const resources = [{ id: 'a', title: 'Planificacion' }]

  const conferencePeriod = {
    start: '2025-08-11T00:00:00-03:00',
    end: '2025-08-16T00:00:00-03:00',
  }

  const inverseBackground = [
    {
      groupId: 'testGroupId',
      start: conferencePeriod.start.substring(0, 10),
      end: conferencePeriod.end.substring(0, 10),
      display: 'inverse-background',
      backgroundColor: '#595959',
    },
  ]

  const isBetweenAllowedDates = (startDate, endDate) => {
    let result =
      startDate >= new Date(conferencePeriod.start) &&
      endDate <= new Date(conferencePeriod.end)
    console.log(
      'handleDateSelect' +
        startDate +
        ' ' +
        new Date(conferencePeriod.start) +
        ' ' +
        endDate +
        new Date(conferencePeriod.end) +
        ' ' +
        ': ' +
        result
    )
    return result
  }

  const handleSelectAllow = (selectInfo) => {
    return isBetweenAllowedDates(selectInfo.start, selectInfo.end)
  }

  const handleEventClick = (info) => {
    console.log('handleEventClick')
    // Only delete if inside allowed range
    if (!isBetweenAllowedDates(info.event.start, info.event.end)) {
      return
    }

    if (window.confirm(`¿Eliminar el evento "${info.event.title}"?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== info.event.id))
    }
  }
  const localISO = (d) =>
    d
      .toLocaleString('sv-SE', { hour12: false })
      .replace(' ', 'T')
      .replace('GMT', '')

  const handleDateClick = (info) => {
    console.log('handleDateClick')
    setEventToDelete(info.event)
    setDeleteDialogOpen(true)
    // const calendarApi = info.view.calendar
    // const viewType = calendarApi.view.type // e.g., "dayGridMonth", "resourceTimeGridDay"
    // console.log("handleDateClick: " + JSON.stringify(info))
    // // Only add events in Month view inside allowed range
    // if (viewType === 'resourceTimeGridDay') {
    //   console.log("viewType: " + viewType)
    // } else if (viewType === 'resourceTimeGridWeek') {
    //   console.log("viewType: " + viewType)
    //   if (!isBetweenAllowedDates(info.date, info.date)) {
    //     return
    //   }
    //   if (window.confirm(`Agregar un evento en "${info.dateStr}"?`)) {
    //     console.log("newEvent")
    //     const start = new Date(info.dateStr)
    //     const end = new Date() // +30 minutes
    //     end.setTime(start.getTime() + 30 * 60 * 1000)
    //
    //     const newEvent = {
    //       id: String(Date.now()),
    //       title: 'Nuevo evento',
    //       start: localISO(start),
    //       end: localISO(end),
    //       resourceId: 'a', // Add this line
    //     }
    //     console.log(newEvent)
    //     setEvents((prev) => [...prev, newEvent])
    //   }
    // } else {
    //   console.error("Unexpected viewType: " + viewType)
    // }
  }

  return (
    <>
      <FullCalendar
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        plugins={[
          resourceTimeGridPlugin,
          timeGridPlugin,
          dayGridPlugin,
          interactionPlugin,
        ]}
        initialView="resourceTimeGridDay"
        selectable={true}
        editable={true}
        selectAllow={handleSelectAllow}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,resourceTimeGridWeek',
        }}
        resources={resources}
        events={[...events, ...inverseBackground]}
      />
      <EventDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        eventTitle={eventToDelete?.title}
        onConfirm={null}
      />
    </>
  )
}
