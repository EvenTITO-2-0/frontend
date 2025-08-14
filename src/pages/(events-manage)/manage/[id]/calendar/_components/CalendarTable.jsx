import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function ResourceCalendar() {
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
    console.log('info.date: ' + JSON.stringify(info, null, 2))
    console.log('TESTOOO: ' + info.dateStr)
    // if (!isBetweenAllowedDates(info.event.start, info.event.end)) {
    //   console.log("is not isBetweenAllowedDates")
    //   return
    // }
    console.log('is between isBetweenAllowedDates')
    if (window.confirm(`¿Eliminar el evento "${info.event.title}"?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== info.event.id))
    }
  }

  const handleDateClick = (info) => {
    console.log('info.date: ' + JSON.stringify(info, null, 2))
    console.log('TESTOOOXDDASDASDSAD: ' + info.dateStr)
    console.log('is between isBetweenAllowedDates1')
    if (!isBetweenAllowedDates(info.date, info.date)) {
      console.log('is not isBetweenAllowedDates')
      return
    }
    if (window.confirm(`Agregar un evento en "${info.dateStr}"?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== info.event.id))
    }
  }

  return (
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
      selectMirror={true}
      editable={true}
      selectAllow={handleSelectAllow}
      eventResizableFromStart={true}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimeGridDay,dayGridMonth',
      }}
      resources={resources}
      events={[...events, ...inverseBackground]}
      eventClick={handleEventClick}
      dateClick={handleDateClick}
    />
  )
}
