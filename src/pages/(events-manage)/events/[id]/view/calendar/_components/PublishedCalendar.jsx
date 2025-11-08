import React, {useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo} from 'react'
import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';
import { format, parseISO, addDays } from 'date-fns'
import '/styles.css'
import {useGetSlotsWithWorksQuery} from "@/hooks/events/slotHooks.js";
// 1. REMOVED the useGetSlotsWithWorksQuery import

// Wrap component in forwardRef to receive a ref from the parent
const PublishedCalendar = forwardRef(({
  startDate,
  endDate,
  eventRooms,
  currentDate
}, ref) => {
  const [events, setEvents] = useState([])
  const calendarRef = useRef(null)

  const { data: eventSlots, isLoading: isLoadingSlots } = useGetSlotsWithWorksQuery()

  useImperativeHandle(ref, () => ({
    getApi: () => calendarRef.current?.getApi(),
  }));

  const resources = eventRooms.map(room => ({ id: room.name, title: room.name }))

  useEffect(() => {
    // This logic is identical to CalendarTable, which is correct.
    const determineType = (type) => {
      if (!type) return 'slot'
      const lowerCaseTitle = type.toLowerCase()
      if (lowerCaseTitle.includes('break')) return 'break'
      if (lowerCaseTitle.includes('plenary')) return 'plenary'
      return 'slot'
    }

    // 4. This "if" block now uses the eventSlots prop.
    //    The dependency array [eventSlots] will correctly
    //    listen for changes to the prop.
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
  }, [eventSlots, currentDate]) // This now correctly depends on the prop

  const conferencePeriod = {
    start: parseISO(startDate),
    end: addDays(parseISO(endDate), 1),
  }

  const inverseBackground = [
    {
      groupId: 'testGroupId',
      start: format(conferencePeriod.start, 'yyyy-MM-dd'),
      end: format(conferencePeriod.end, 'yyyy-MM-dd'),
      display: 'inverse-background',
      backgroundColor: '#595959',
    },
  ]

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

    // --- START: NEW HOURLY ROUNDING LOGIC ---

    const hourRounding = 60; // 60 minutes

    // 1. Round MIN START down to the nearest hour (e.g., 2:59 -> 2:00)
    const finalMinMinutes = Math.floor(minStartMinutes / hourRounding) * hourRounding;

    // 2. Round MAX END up to the nearest hour (e.g., 4:01 -> 5:00)
    // Note: 15:00 (900 mins) -> ceil(900/60)*60 = 15*60 = 900 (15:00)
    // Note: 15:01 (901 mins) -> ceil(901/60)*60 = 16*60 = 960 (16:00)
    const finalMaxMinutes = Math.min(24 * 60, Math.ceil(maxEndMinutes / hourRounding) * hourRounding);


    // 3. Convert final minutes back to HH:mm:ss format
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
    // --- END: NEW HOURLY ROUNDING LOGIC ---

  }, [eventSlots]);

  return (
    <div style={{ position: 'relative' }}>
      <FullCalendar
        ref={calendarRef} // Use the internal ref here
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
        editable={false}
        selectable={false}
        eventContent={renderEventContent}
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
        events={[...events]}
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        slotLabelInterval="01:00"
        height="auto"
        slotLabelFormat={{
          hour: 'numeric',      // '4' (use '2-digit' for '04')
          minute: '2-digit',    // '00'
          omitZeroMinute: false // This is the key
        }}
      />
    </div>
  )
})

export default PublishedCalendar

// This function remains the same
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