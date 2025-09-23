import React, { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import {
  addMilliseconds,
  differenceInMilliseconds,
  format,
  formatISO,
  isWithinInterval,
  parseISO,
  addDays,
} from 'date-fns'
import EventDialog from './EventDialog'
import '/styles.css'
import Icon from '@/components/Icon.jsx'

export default function ResourceCalendar({startDate, endDate, onAddNewSlot}) {

  if (!startDate || !endDate) {
    return <NoDatesMessage />
  }

  const [events, setEvents] = useState([])

  const [lastSelectedType, setLastSelectedType] = useState('slot')

  const conferencePeriod = {
    start: parseISO(startDate),
    end: addDays(parseISO(endDate), 1),
  }

  // Horas por defecto para cada tipo de evento, capaz hacer configurable en el futuro
  const [lastDurations, setLastDurations] = useState({
    slot: 3600000 * 2,
    break: 3600000 / 4,
    plenary: 3600000,
  })

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [copiedEvent, setCopiedEvent] = useState(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [dialogEventInfo, setDialogEventInfo] = useState(null)
  const [isNewEvent, setIsNewEvent] = useState(false)

  const resources = [{ id: 'a', title: 'Planificacion' }]
  const inverseBackground = [
    {
      groupId: 'testGroupId',
      start: format(conferencePeriod.start, 'yyyy-MM-dd'),
      end: format(conferencePeriod.end, 'yyyy-MM-dd'),
      display: 'inverse-background',
      backgroundColor: '#595959',
    },
  ]

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        if (selectedEvent) {
          setCopiedEvent(selectedEvent)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedEvent])

  const isBetweenAllowedDates = (startDate, endDate) => {
    return (
      isWithinInterval(startDate, {
        start: conferencePeriod.start,
        end: conferencePeriod.end,
      }) &&
      isWithinInterval(endDate, {
        start: conferencePeriod.start,
        end: conferencePeriod.end,
      })
    )
  }

  const handleSelectAllow = (selectInfo) => {
    return isBetweenAllowedDates(selectInfo.start, selectInfo.end)
  }

  const handleEventClick = (info) => {
    if (!isBetweenAllowedDates(info.event.start, info.event.end)) {
      return
    }
    setSelectedEvent(info.event)
    setDialogEventInfo(info.event)
    setIsNewEvent(false)
    setIsEventDialogOpen(true)
  }

  const handleDateSelect = (selectInfo) => {
    if (!isBetweenAllowedDates(selectInfo.start, selectInfo.end)) {
      console.log('Selected range is outside conference period.')
      return
    }

    if (copiedEvent) {
      const duration = differenceInMilliseconds(
        copiedEvent.end,
        copiedEvent.start
      )
      const newEndTime = addMilliseconds(selectInfo.start, duration)
      const newEvent = {
        id: String(Date.now()),
        title: copiedEvent.title,
        start: selectInfo.startStr,
        end: formatISO(newEndTime),
        resourceId: selectInfo.resource?.id,
      }
      setEvents((prev) => [...prev, newEvent])
      setCopiedEvent(null)
    } else {
      // Caso single clic - crear nuevo evento con tiempo por defecto
      const duration = differenceInMilliseconds(
        selectInfo.end,
        selectInfo.start
      )
      let calculatedEndStr = selectInfo.endStr
      if (duration === 0) {
        const defaultDuration = lastDurations[lastSelectedType]
        const calculatedEndDate = addMilliseconds(
          selectInfo.start,
          defaultDuration
        )
        calculatedEndStr = formatISO(calculatedEndDate)
      }

      // Crear evento
      setDialogEventInfo({
        ...selectInfo,
        endStr: calculatedEndStr,
      })
      setIsNewEvent(true)
      setIsEventDialogOpen(true)
    }
  }

  const handleSaveEvent = (eventData) => {
    const { id, title, start, end, type } = eventData

    // Se calcula la diferencia y se reusa en la proxima ejecucion ---> una poronga esto
    //TODO que no sea más una poronga
    const newDuration = differenceInMilliseconds(end, start)
    setLastDurations((prev) => ({
      ...prev,
      [type]: newDuration,
    }))
    setLastSelectedType(type)

    if (id) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id
            ? {
                ...event,
                title,
                start: formatISO(start),
                end: formatISO(end),
                extendedProps: { type },
              }
            : event
        )
      )
      onAddNewSlot(events.find(event => event.id === id))
    } else {
      const newEvent = {
        id: String(Date.now()),
        title,
        start: formatISO(start),
        end: formatISO(end),
        resourceId: dialogEventInfo?.resource?.id,
        extendedProps: { type },
      }
      setEvents((prev) => [...prev, newEvent])
      onAddNewSlot(newEvent)
    }
  }

  const handleDeleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  const handleEventResize = (info) => {
    const newStart = info.event.start
    const newEnd = info.event.end
    if (!isBetweenAllowedDates(newStart, newEnd)) {
      console.log('Resize is outside conference period. Reverting.')
      info.revert()
      return
    }
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === info.event.id
          ? {
              ...event,
              start: info.event.startStr,
              end: info.event.endStr,
            }
          : event
      )
    )
  }

  const handleEventDrop = (info) => {
    const newStart = info.event.start
    const newEnd = info.event.end
    const newResource = info.newResource
    const currentResource = info.event.getResources()[0]
    const currentResourceId = currentResource ? currentResource.id : null
    const finalResourceId = newResource ? newResource.id : currentResourceId
    if (!isBetweenAllowedDates(newStart, newEnd)) {
      console.log('Drop is outside conference period. Reverting.')
      info.revert()
      return
    }
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === info.event.id
          ? {
              ...event,
              start: info.event.startStr,
              end: info.event.endStr,
              resourceId: finalResourceId,
            }
          : event
      )
    )
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
        select={handleDateSelect}
        eventResize={handleEventResize}
        eventDrop={handleEventDrop}
        eventClassNames={(info) => {
          const type = info.event.extendedProps?.type || 'slot'
          const classes = [`event-${type}`]
          if (info.event.id === selectedEvent?.id) {
            classes.push('event-selected')
          }
          return classes
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,resourceTimeGridWeek',
        }}
        resources={resources}
        events={[...events, ...inverseBackground]}
      />
      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        eventInfo={dialogEventInfo}
        isNewEvent={isNewEvent}
        lastSelectedType={lastSelectedType}
        lastDurations={lastDurations}
      />
    </>
  )
}

function NoDatesMessage() {
  return (
    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
      <Icon name="CalendarClock" />
      <p className="text-lg">
        Configura las fechas de inicio y fin de presentaciones para agregar
        actividades al evento.
      </p>
    </div>
  )
}