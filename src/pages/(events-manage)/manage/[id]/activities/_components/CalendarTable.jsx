import React, { useEffect, useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';

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
import {
  useCreateSlotMutation,
  useDeleteSlotMutation,
  useGetSlotsWithWorksQuery, useGetUnassignedSlotsWithWorksQuery,
  useUpdateSlotMutation,
} from '@/hooks/events/slotHooks.js'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import SlotEditDialog from '@/pages/(events-manage)/manage/[id]/activities/_components/SlotEditDialog.jsx'

// This function goes inside CalendarTable.jsx or in its own file
const renderEventContent = (eventInfo) => {
  const { works, originalType } = eventInfo.event.extendedProps
  const type = originalType || 'slot'

  // 1. Handle Plenary / Break
  if (type.includes('plenary') || type.includes('break')) {
    return (
      <div className="event-content-simple">
        <strong>{eventInfo.event.title}</strong>
      </div>
    )
  }

  // 2. Handle Slots (with or without works)
  const hasWorks = works && works.length > 0
  let groupedByTrack = {}

  if (hasWorks) {
    groupedByTrack = works.reduce((acc, work) => {
      const trackName = work.track || 'No Track'
      if (!acc[trackName]) {
        acc[trackName] = []
      }
      acc[trackName].push(work)
      return acc
    }, {})
  }

  return (
    <div className="event-content-grouped">
      {/* --- VERSION 1: FULL LAYOUT (Default) --- */}
      <div className="event-layout-full">
        {!hasWorks && (
          <div className="event-slot-title">
            <strong>{eventInfo.event.title || 'Slot Vacío'}</strong>
          </div>
        )}

        {hasWorks && Object.entries(groupedByTrack).map(([trackName, worksInGroup]) => (
          <div key={trackName} className="track-group">
            <span className="track-tag">{trackName}</span>
            <div className="work-id-list">
              {worksInGroup.map((work) => (
                <span key={work.id} className="work-id-chip">
                  {work.work_number}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- VERSION 2: MEDIUM LAYOUT (Sideways) --- */}
      <div className="event-layout-medium">
        {!hasWorks && (
          <div className="event-slot-title">
            <strong>{eventInfo.event.title || 'Slot Vacío'}</strong>
          </div>
        )}
        {hasWorks && Object.entries(groupedByTrack).map(([trackName, worksInGroup]) => (
          <div key={trackName} className="track-group">
            <span className="track-tag">{trackName}</span>
            <div className="work-id-list">
              {worksInGroup.map((work) => (
                <span key={work.id} className="work-id-chip">
                  {work.work_number}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>


      {/* --- VERSION 3: SMALL LAYOUT (Tag only) --- */}
      <div className="event-layout-small">
        {hasWorks && Object.entries(groupedByTrack).map(([trackName]) => (
          <span key={trackName} className="track-tag">{trackName}</span>
        ))}
        {!hasWorks && (
          <div className="event-slot-title">
            <strong>Slot</strong>
          </div>
        )}
      </div>
    </div>
  )
}


export default function CalendarTable({
  startDate,
  endDate,
  eventRooms,
}) {
  const observerMap = useRef(new Map())
  const { data: eventSlots, isLoading: isLoadingSlots } = useGetSlotsWithWorksQuery()
  const { data: unassignedWorks, isLoading: isLoadingUnassigned } = useGetUnassignedSlotsWithWorksQuery()

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

    if (eventSlots) {
      const transformedSlots = eventSlots.map(slot => {
        const type = determineType(slot.slot_type)
        const works = slot.works || []
        let title = slot.title

        if (type === 'slot') {
          title = 'Sin trabajos asignados'
        }
        let numTracks = 0;
          if (works.length > 0) {
            const grouped = works.reduce((acc, work) => {
              const trackName = work.track || 'No Track';
              if (!acc[trackName]) acc[trackName] = [];
              acc[trackName].push(work);
              return acc;
          }, {});
          numTracks = Object.keys(grouped).length;
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
            originalType: slot.slot_type,
            numTracks: numTracks
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

  // Add this useEffect for cleanup
  useEffect(() => {
    const map = observerMap.current
    return () => {
      map.forEach(observer => observer.disconnect())
      map.clear()
    }
  }, [])


  // --- NEW: Thresholds for 3 display modes (Full > Medium > Small) ---
  // Tune these values based on your UI
  const THRESHOLD_SMALL_FIXED = 40; // (e.g., 50px) Below this, show smallest view
  const THRESHOLD_MEDIUM_BASE = 90; // (e.g., 90px) Base height for medium view
  const THRESHOLD_MEDIUM_PER_TRACK = 40; // (e.g., 40px) Add this for each track


  // --- UPDATED: Handler now supports 3 modes ---
  const handleEventDidMount = (mountInfo) => {
    const el = mountInfo.el
    const event = mountInfo.event
    const eventId = event.id
    const numTracks = event.extendedProps.numTracks || 0

    // 1. Calculate the medium threshold (dynamic)
    let thresholdMedium = THRESHOLD_MEDIUM_BASE;
    if (numTracks > 1) {
      // Add extra height for each track after the first one
      thresholdMedium += (numTracks - 1) * THRESHOLD_MEDIUM_PER_TRACK;
    }

    // 2. The small threshold is fixed
    const thresholdSmall = THRESHOLD_SMALL_FIXED;

    const observer = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return

      const height = entries[0].contentRect.height

      // 3. Compare height and set classes
      if (height < thresholdSmall) {
        // --- SMALL STATE ---
        if (!el.classList.contains('is-small')) {
            console.log(`Event ${eventId}: ADDING .is-small (Height: ${height.toFixed(1)} < ${thresholdSmall})`);
        }
        el.classList.add('is-small');
        el.classList.remove('is-medium');
      } else if (height < thresholdMedium) {
        // --- MEDIUM STATE ---
        if (!el.classList.contains('is-medium')) {
            console.log(`Event ${eventId}: ADDING .is-medium (Height: ${height.toFixed(1)} < ${thresholdMedium})`);
        }
        el.classList.add('is-medium');
        el.classList.remove('is-small');
      } else {
        // --- FULL STATE ---
        if (el.classList.contains('is-small') || el.classList.contains('is-medium')) {
            console.log(`Event ${eventId}: REMOVING classes (Height: ${height.toFixed(1)} >= ${thresholdMedium})`);
        }
        el.classList.remove('is-small');
        el.classList.remove('is-medium');
      }
    })

    observer.observe(el)
    observerMap.current.set(eventId, observer)
  }

  // No change to this function
  const handleEventWillUnmount = (unmountInfo) => {
    const observer = observerMap.current.get(unmountInfo.event.id)
    if (observer) {
      observer.disconnect()
      observerMap.current.delete(unmountInfo.event.id)
    }
  }

  const isLoading = isLoadingSlots || isLoadingUnassigned;
  const numUnassigned = unassignedWorks?.length || 0;
  const numAssigned = eventSlots?.reduce((acc, slot) => {
    return acc + (slot.works?.length || 0);
  }, 0) || 0;
  const totalWorks = numAssigned + numUnassigned;
  const allAssigned = numUnassigned === 0;

  return (
    <>
      <div style={{ position: 'relative' }}>
        {!isLoading && unassignedWorks && eventSlots && (
          <div className={allAssigned ? "unassigned-success" : "unassigned-warning"}>
            {allAssigned ? (
              <>
                <CheckCircle className="status-icon" /> {totalWorks} de {totalWorks} {" "} {"trabajos asignados"}.
              </>
            ) : (
              <>
                <AlertTriangle className="status-icon" /> {numUnassigned} de {totalWorks}
                {numUnassigned === 1 ? " trabajos sin asignar." : " trabajos sin asignar."}
              </>
            )}
          </div>
        )}
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

          initialView="resourceTimeGridDay"
          initialDate={startDate}
          editable={isEditable}
          selectable={isEditable}
          selectAllow={handleSelectAllow}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventResize={handleEventResize}
          eventDrop={handleEventDrop}
          allDaySlot={false}
          eventContent={renderEventContent}
          eventClassNames={(info) => {
            const type = info.event.extendedProps.type || 'slot'
            const hasWorks = info.event.extendedProps.works?.length > 0
            const classes = [
              `event-${type}`,
              hasWorks && 'event-with-works',
            ].filter(Boolean)

            if (info.event.id === selectedEvent?.id) {
              classes.push('event-selected')
            }
            return classes
          }}
          headerToolbar={{
            right: 'prevDay today nextDay',
            left: 'title',
            center: '',
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
              text: 'Primer día',
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
          eventDidMount={handleEventDidMount}
          eventWillUnmount={handleEventWillUnmount}
        />
        </div>
      <SlotEditDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        eventInfo={dialogEventInfo}
        isNewEvent={isNewEvent}
        lastSelectedType={lastSelectedType}
        disabled={isEditable}
        unassignedWorks={unassignedWorks}
        withWorksTab={true}
      />
    </>
  )
}