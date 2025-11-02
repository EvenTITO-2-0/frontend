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
import {
  useCreateSlotMutation,
  useDeleteSlotMutation,
  useGetSlotsWithWorksQuery,
  useUpdateSlotMutation,
} from '@/hooks/events/slotHooks.js'

export default function CalendarTable({
  startDate,
  endDate,
  eventRooms,
}) {
  const { data: eventSlots, isLoading } = useGetSlotsWithWorksQuery()
  const calendarRef = useRef(null)
  const useDeleteSlot = useDeleteSlotMutation()
  const useCreateSlot = useCreateSlotMutation()
  const useUpdateSlot = useUpdateSlotMutation()
  const resources = eventRooms.map(room => ({ id: room.name, title: room.name }))

  useEffect(() => {
    const determineType = (type) => {
      if (!type) return 'slot'
      const lowerCaseTitle = type.toLowerCase()
      if (lowerCaseTitle.includes('break')) return 'break'
      if (lowerCaseTitle.includes('plenary')) return 'plenary'
      return 'slot'
    }
    console.log('Received slots from parent:', eventSlots)
    console.log('Received eventRooms from parent:', eventRooms)

    if (eventSlots) {
      const transformedSlots = eventSlots.map(slot => {
        const type = determineType(slot.slot_type)
        const works = slot.works || []
        let title = slot.slot_type

        if (works.length > 0) {
          title = works.map(w =>
            `Work ID: ${w.id.substring(0, 8)}...`
          ).join('\n')
        } else if (type === 'slot') {
          title = 'Available Slot'
        }

        return {
          id: String(slot.id),
          start: slot.start,
          end: slot.end,
          resourceId: slot.room_name,
          type: type,
          title: title,
          extendedProps: {
            works: works,
            originalType: slot.slot_type
          }
        }
      })
      setEvents(transformedSlots)
    }
  }, [eventSlots])


  const isEditable = true // eventStatus !== 'STARTED'
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
      // Update the slot on backend (if we have a numeric id)
      updateSlotAsync(updatedEvent)
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
      // Create the slot on backend
      createSlotAsync(newEvent)
    }
  }

  const handleDeleteEvent = (eventId) => {
    // Attempt to delete on backend first
    deleteSlotAsync(eventId)
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
    // Persist change to backend
    updateSlotAsync({
      id: info.event.id,
      start: info.event.startStr,
      end: info.event.endStr,
      resourceId: info.event.getResources()[0]?.id,
      title: info.event.title,
      type: info.event.extendedProps.type || info.event.type,
    })
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
    updateSlotAsync({
      id: info.event.id,
      start: info.event.startStr,
      end: info.event.endStr,
      resourceId: finalResourceId,
      title: info.event.title,
      type: info.event.extendedProps.type || info.event.type,
    })
  }

  const isNumericId = (id) => /^\d+$/.test(String(id))

  const createSlotAsync = async (slot) => {
    try {
      const body = {
        title: slot.title,
        start: slot.start,
        end: slot.end,
        type: slot.type,
        room_name: slot.resourceId || slot.room_name,
      }
      return await useCreateSlot.mutateAsync({slot: body})
    } catch (err) {
      console.error('Failed to create slot', err)
    }
  }

  const updateSlotAsync = async (slot) => {
    if (!isNumericId(slot.id)) return
    try {
      const body = {
        title: slot.title,
        start: slot.start,
        end: slot.end,
        type: slot.type,
        room_name: slot.resourceId || slot.room_name,
      }
      return await useUpdateSlot.mutateAsync({slotId: slot.id, slot: body})
    } catch (err) {
      console.error('Failed to update slot', err)
    }
  }

  const deleteSlotAsync = async (slotId) => {
    if (!isNumericId(slotId)) return
    try {
      return await useDeleteSlot.mutateAsync({ slotId: slotId })
    } catch (err) {
      console.error('Failed to delete slot', err)
    }
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
        eventContent={renderEventContent}
        eventClassNames={(info) => {
          const type = info.event.extendedProps.originalType || info.event.type || 'slot'
          const classes = [`event-${type}`]

          if (info.event.id === selectedEvent?.id) {
            classes.push('event-selected')
          }

          if (info.event.extendedProps.works?.length > 0) {
            classes.push('event-assigned')
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


const renderEventContent = (eventInfo) => {
    const { works, originalType } = eventInfo.event.extendedProps;
    const type = originalType || 'slot';

    if (type.includes('plenary') || type.includes('break')) {
      return (
        <div className="event-content-simple">
          <strong>{eventInfo.event.title}</strong>
        </div>
      );
    }

    if (works && works.length > 0) {
      return (
        <div className="event-content-work">
          {works.map((work) => {
            const trackClass = work.track
              ? `event-track-${work.track.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
              : '';

            return (
              <div key={work.id} className="work-item">
                <span className="track-tag">
                  {work.track || 'No Track'}
                </span>

                <div className="work-id-container">
                  <div className={`color-square ${trackClass}`}></div>
                  <span className="work-id">ID: {work.id.substring(0, 8)}...</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <div className="event-content-simple">
        <em>{eventInfo.event.title}</em>
      </div>
    );
  };