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
import '/styles.css'
import esLocale from '@fullcalendar/core/locales/es'
import SlotEditDialog from '@/pages/(events-manage)/manage/[id]/activities/_components/SlotEditDialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'

export default function CalendarTemplateTable({ startDate, endDate, onAddNewSlot, onDeleteSlot, slots = [], eventRooms }) {
  const calendarRef = useRef(null)

  useEffect(() => {
    setEvents(slots)
  }, [slots])

  const isEditable = true

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

  const resources = [{ id: 'a', title: 'Plantilla de planificacion' }]
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
        room_name: copiedEvent.room_name
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
    const { id, title, start, end, type, room_name} = eventData

    const newDuration = differenceInMilliseconds(end, start)
    setLastDurations((prev) => ({
      ...prev,
      [type]: newDuration,
    }))

    setLastSelectedType(type)

    if (id) {
      const originalEvent = events.find((e) => e.id === id);
      const updatedEvent = {
        ...originalEvent,
        title,
        start: formatISO(start),
        end: formatISO(end),
        type: type,
        room_name: room_name
      };
      setEvents((prevEvents) =>
          prevEvents.map((event) =>
              event.id === id ? updatedEvent : event
          )
      )
      onAddNewSlot(updatedEvent);
    } else {
      const newEvent = {
        id: String(Date.now()),
        title,
        start: formatISO(start),
        end: formatISO(end),
        resourceId: dialogEventInfo?.resource?.id,
        type: type,
        room_name: room_name
      }
      setEvents((prev) => [...prev, newEvent])
      onAddNewSlot(newEvent)
    }
  }

  const handleEventResize = (info) => {
    const newStart = info.event.start
    const newEnd = info.event.end
    if (!isBetweenAllowedDates(newStart, newEnd)) {
      info.revert()
      return
    }

    let updatedEvent = info.event // To capture the updated event

    setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === info.event.id) {
            updatedEvent = {
              ...event,
              start: info.event.startStr,
              end: info.event.endStr,
            }
            return updatedEvent
          }
          return event
        })
    )

    if (updatedEvent) {
      onAddNewSlot(updatedEvent)
    }
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

    let updatedEvent = null

    setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === info.event.id) {
            updatedEvent = {
              ...event,
              start: info.event.startStr,
              end: info.event.endStr,
              resourceId: finalResourceId,
            }
            return updatedEvent
          }
          return event
        })
    )

    if (updatedEvent) {
      onAddNewSlot(updatedEvent)
    }
  }

  const eventContent = (arg) => {
    const { title } = arg.event;
    const type = arg.event.extendedProps.type;

    return (
      <>
        {type === "slot" ? <div>Presentación de trabajos</div> : <div>{title}</div> }
        {type === "plenary" && (
          <div style={{ fontSize: '1em', color: '#ffffff' }}>
            <strong>{arg.event.extendedProps.room_name}</strong>
          </div>
        )}
      </>
    );
  }

  console.log("Event rooms: " + JSON.stringify(eventRooms))
  return (
    <>
      <FullCalendar
        ref={calendarRef}
        locale={esLocale}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        plugins={[
          resourceTimeGridPlugin,
          timeGridPlugin,
          dayGridPlugin,
          interactionPlugin,
        ]}
        initialView="resourceTimeGridSevenDay"
        initialDate={startDate}
        editable={isEditable}
        selectable={isEditable}
        selectAllow={handleSelectAllow}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventResize={handleEventResize}
        eventDrop={handleEventDrop}
        allDaySlot={false}
        eventContent={eventContent}
        eventClassNames={(info) => {
          const type = info.event.extendedProps.type || 'slot'
          const classes = [`event-${type}`]
          if (info.event.id === selectedEvent?.id) {
            classes.push('event-selected')
          }
          return classes
        }}
        headerToolbar={{
          left: 'prevWeek,prevDay nextDay,nextWeek',
          center: 'title',
          right: 'resourceTimeGridDay,resourceTimeGridSevenDay',
        }}
        views={{
          resourceTimeGridSevenDay: {
            type: 'resourceTimeGrid',
            duration: { days: 7 },
            buttonText: 'Week',
          },
        }}
        customButtons={{
          prevWeek: {
            icon: 'chevrons-left',
            click: () => {
              const calendarApi = calendarRef.current?.getApi()
              if (calendarApi) {
                const newStart = addDays(calendarApi.view.currentStart, -7)
                calendarApi.gotoDate(newStart)
              }
            },
          },
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
          nextWeek: {
            icon: 'chevrons-right',
            click: () => {
              const calendarApi = calendarRef.current?.getApi()
              if (calendarApi) {
                const newStart = addDays(calendarApi.view.currentStart, 7)
                calendarApi.gotoDate(newStart)
              }
            },
          },
        }}
        resources={resources}
        events={[...events, ...inverseBackground]}
      />
      <SlotEditDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSave={handleSaveEvent}
        onDelete={onDeleteSlot}
        eventInfo={dialogEventInfo}
        isNewEvent={isNewEvent}
        lastSelectedType={lastSelectedType}
        disabled={!isEditable}
        withWorksTab={false}
        eventRooms={eventRooms}
      />
    </>
  )
}