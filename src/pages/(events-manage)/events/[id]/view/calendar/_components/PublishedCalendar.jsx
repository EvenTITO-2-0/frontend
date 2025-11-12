import React, {useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo} from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';
import { format, parseISO, addDays } from 'date-fns'
import '/styles.css'
import { useGetSlotsWithWorksQuery } from "@/hooks/events/slotHooks.js"; // This is needed

// --- 1. DEFINE THE 3-STATE RENDERER ---
// This is the 3-state renderEventContent function we built
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


// --- 2. THE COMPONENT ---
const PublishedCalendar = forwardRef(({
  startDate,
  endDate,
  eventRooms,
  currentDate
}, ref) => {
  const [events, setEvents] = useState([])
  const calendarRef = useRef(null)

  // --- ADDED: Ref for ResizeObservers ---
  const observerMap = useRef(new Map())

  const { data: eventSlots, isLoading: isLoadingSlots } = useGetSlotsWithWorksQuery()

  useImperativeHandle(ref, () => ({
    getApi: () => calendarRef.current?.getApi(),
  }));

  const resources = eventRooms.map(room => ({ id: room.name, title: room.name }))

  // --- UPDATED: useEffect to process slots AND numTracks ---
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
        let title = slot.title // Use slot_type as base title

        if (type === 'slot' && works.length === 0) {
          title = 'Available Slot' // Or 'Slot Vacío'
        }

        // Calculate numTracks
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
          title: title, // Use the determined title
          extendedProps: {
            works: works,
            originalType: slot.slot_type,
            numTracks: numTracks // Store numTracks
          }
        }
      })
      setEvents(transformedSlots)
    }
  }, [eventSlots, currentDate]) // Keep dependencies

  const conferencePeriod = {
    start: parseISO(startDate),
    end: addDays(parseISO(endDate), 1),
  }

  // (Your inverseBackground and useMemo for slotMinTime/slotMaxTime remain unchanged)
  // ... (keep inverseBackground logic)
  // ... (keep useMemo logic)
  const { slotMinTime, slotMaxTime } = useMemo(() => {
    // Set a default view (e.g., 8am to 6pm) if no slots exist
    if (!eventSlots || eventSlots.length === 0) {
      return { slotMinTime: '08:00:00', slotMaxTime: '18:00:00' };
    }

    let minStartMinutes = 24 * 60; // 1440
    let maxEndMinutes = 0;

    eventSlots.forEach(slot => {
      try {
        const start = parseISO(slot.start);
        const end = parseISO(slot.end);
        const currentStartMinutes = start.getHours() * 60 + start.getMinutes();
        const currentEndMinutes = end.getHours() * 60 + end.getMinutes();
        if (currentStartMinutes < minStartMinutes) minStartMinutes = currentStartMinutes;
        if (currentEndMinutes > maxEndMinutes) maxEndMinutes = currentEndMinutes;
      } catch (e) {
        console.error("Error parsing slot dates", e);
      }
    });

    if (minStartMinutes === 1440 || maxEndMinutes === 0) {
      return { slotMinTime: '08:00:00', slotMaxTime: '18:00:00' };
    }

    const hourRounding = 60; // 60 minutes
    const finalMinMinutes = Math.floor(minStartMinutes / hourRounding) * hourRounding;
    const finalMaxMinutes = Math.min(24 * 60, Math.ceil(maxEndMinutes / hourRounding) * hourRounding);
    const minHour = String(Math.floor(finalMinMinutes / 60)).padStart(2, '0');
    const minMinute = String(finalMinMinutes % 60).padStart(2, '0'); // Will be "00"
    const maxHour = String(Math.floor(finalMaxMinutes / 60)).padStart(2, '0');
    const maxMinute = String(finalMaxMinutes % 60).padStart(2, '0'); // Will be "00"
    let maxTimeStr = `${maxHour}:${maxMinute}:00`;
    if (finalMaxMinutes === 1440) {
      maxTimeStr = '24:00:00';
    }
    return {
      slotMinTime: `${minHour}:${minMinute}:00`,
      slotMaxTime: maxTimeStr
    };
  }, [eventSlots]);


  // --- 3. ADD ALL THE LAYOUT LOGIC ---

  // useEffect for cleanup
  useEffect(() => {
    const map = observerMap.current
    return () => {
      map.forEach(observer => observer.disconnect())
      map.clear()
    }
  }, [])

  // Thresholds for 3 display modes
  const THRESHOLD_SMALL_FIXED = 50;
  const THRESHOLD_MEDIUM_BASE = 90;
  const THRESHOLD_MEDIUM_PER_TRACK = 40;

  // Reusable function to apply classes
  const applyLayoutClasses = (el, event) => {
    const numTracks = event.extendedProps.numTracks || 0;

    let thresholdMedium = THRESHOLD_MEDIUM_BASE;
    if (numTracks > 1) {
      thresholdMedium += (numTracks - 1) * THRESHOLD_MEDIUM_PER_TRACK;
    }
    const thresholdSmall = THRESHOLD_SMALL_FIXED;
    const height = el.getBoundingClientRect().height;

    if (height < thresholdSmall) {
      el.classList.add('is-small');
      el.classList.remove('is-medium');
    } else if (height < thresholdMedium) {
      el.classList.add('is-medium');
      el.classList.remove('is-small');
    } else {
      el.classList.remove('is-small');
      el.classList.remove('is-medium');
    }
  }

  // Handler for eventDidMount
  const handleEventDidMount = (mountInfo) => {
    const el = mountInfo.el;
    const event = mountInfo.event;
    applyLayoutClasses(el, event); // Apply immediately
    const observer = new ResizeObserver(() => {
      applyLayoutClasses(el, event);
    });
    observer.observe(el);
    observerMap.current.set(event.id, observer);
  }

  // Handler for eventWillUnmount
  const handleEventWillUnmount = (unmountInfo) => {
    const observer = observerMap.current.get(unmountInfo.event.id)
    if (observer) {
      observer.disconnect()
      observerMap.current.delete(unmountInfo.event.id)
    }
  }


  // --- 4. RETURN THE JSX ---
  return (
    <div style={{ position: 'relative' }}>
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
        allDaySlot={false}
        initialView="resourceTimeGridDay"
        initialDate={startDate}
        editable={false} // This is read-only
        selectable={false} // This is read-only
        eventContent={renderEventContent} // Use our 3-state renderer
        eventClick={(info) => {
          console.log('Clicked event:', info.event.extendedProps.works)
        }}
        eventClassNames={(info) => {
          const type = info.event.extendedProps.type || 'slot'
          const hasWorks = info.event.extendedProps.works?.length > 0
          return [
            `event-${type}`,
            hasWorks && 'event-with-works',
          ].filter(Boolean)
        }}
        headerToolbar={false}
        resources={resources}
        events={[...events]} // Note: We removed inverseBackground, add it back if you need it
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        slotLabelInterval="01:00"
        height="auto"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false
        }}

        // --- ADDED: The mount/unmount props ---
        eventDidMount={handleEventDidMount}
        eventWillUnmount={handleEventWillUnmount}
      />
    </div>
  )
})

export default PublishedCalendar