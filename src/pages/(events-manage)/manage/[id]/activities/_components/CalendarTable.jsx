import React, { useEffect, useState, useRef } from 'react'
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

export default function CalendarTable({ startDate, endDate, onAddNewSlot, slots, eventRooms, eventStatus }) {
  const calendarRef = useRef(null)

  //const resources = [{ id: 'a', title: 'Sala A' }, { id: 'b', title: 'Sala B' }, { id: 'c', title: 'Sala C' }]
  // Create a map for efficient lookup of resource IDs from room names.

  const resources = eventRooms.map(room => ({ id: room.name, title: room.name }))

  // This hook now transforms the backend `slots` data into the format FullCalendar needs.
  useEffect(() => {
    // Helper function to infer event type from its title (from backend's `slot_id`).
    // This is used for styling and setting default durations on the frontend.
    const determineType = (title) => {
      const lowerCaseTitle = title.toLowerCase()
      if (lowerCaseTitle.includes('break')) return 'break'
      if (lowerCaseTitle.includes('plenary')) return 'plenary'
      return 'slot'
    }
    console.log('Received slots from parent:', slots)
    if (slots) {
      const transformedSlots = slots.map(slot => ({
        id: String(slot.id),                          // Maps from DB 'id'
        start: slot.start,                          // Maps from DB 'start'
        end: slot.end,                              // Maps from DB 'end'
        resourceId: slot.room_name, // Maps from DB 'room_name'
        type: determineType(slot.type),          // 'type' is derived for frontend use
      }))
      setEvents(transformedSlots)
    }
  }, [slots]) // This hook re-runs whenever the parent passes new 'slots' data.


  const isEditable = eventStatus !== 'STARTED'

  const [events, setEvents] = useState([])
  const [lastSelectedType, setLastSelectedType] = useState('slot')

  const conferencePeriod = {
    start: parseISO(startDate),
    end: addDays(parseISO(endDate), 1),
  }

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
        type: copiedEvent.type,
      }
      setEvents((prev) => [...prev, newEvent])
      setCopiedEvent(null)
    } else {
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

    const newDuration = differenceInMilliseconds(end, start)
    setLastDurations((prev) => ({
      ...prev,
      [type]: newDuration,
    }))

    setLastSelectedType(type)

    if (id) {
        const updatedEvent = {
            id,
            title,
            start: formatISO(start),
            end: formatISO(end),
            type: type,
            resourceId: dialogEventInfo?.resource?.id || events.find(e => e.id === id)?.resourceId
        };
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? updatedEvent : event
        )
      )
      onAddNewSlot(updatedEvent)
    } else {
      const newEvent = {
        id: String(Date.now()),
        title,
        start: formatISO(start),
        end: formatISO(end),
        resourceId: dialogEventInfo?.resource?.id,
        type: type,
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
        ref={calendarRef}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        plugins={[
          resourceTimeGridPlugin,
          timeGridPlugin,
          dayGridPlugin,
          interactionPlugin,
        ]}
        initialView="resourceTimeGridDay"
        initialDate={startDate}
        editable={isEditable}
        selectable={isEditable}
        selectAllow={handleSelectAllow}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventResize={handleEventResize}
        eventDrop={handleEventDrop}
        eventClassNames={(info) => {
          // Note: FullCalendar uses `event.extendedProps.type` but we are passing a top-level `type` property.
          // This works for now, but for robustness, you might move `type` into an `extendedProps` object.
          const type = info.event.extendedProps.type || info.event.type || 'slot'
          const classes = [`event-${type}`]
          if (info.event.id === selectedEvent?.id) {
            classes.push('event-selected')
          }
          return classes
        }}
        headerToolbar={{
          left: 'prevDay today nextDay',
          center: 'title',
          right: '',
        }}

        customButtons={{
          prevDay: {
            icon: 'chevron-left',
            click: () => {
              const calendarApi = calendarRef.current?.getApi()
              if (calendarApi) {
                const newStart = addDays(calendarApi.view.currentStart, -1)
                calendarApi.gotoDate(newStart)
              }
            },
          },
          today: {
            text: 'Primer día del evento',
            click: () => {
              const calendarApi = calendarRef.current?.getApi()
              if (calendarApi) {
                // Go to the event start date, not the real "today"
                calendarApi.gotoDate(startDate)
              }
            },
          },
          nextDay: {
            icon: 'chevron-right',
            click: () => {
              const calendarApi = calendarRef.current?.getApi()
              if (calendarApi) {
                const newStart = addDays(calendarApi.view.currentStart, 1)
                calendarApi.gotoDate(newStart)
              }
            },
          },
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
        disabled={!isEditable}
      />
    </>
  )
}
