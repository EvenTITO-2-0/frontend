import { useState, useRef } from 'react'
import { Calendar, ChevronDown, ChevronRight, MapPin, Search } from 'lucide-react'
// Import the modified calendar
import TalkDetails from './_components/TalkDetails'
import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import LineTabs from '@/components/LineTabs.jsx'
import { format, parseISO, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import PublishedCalendar from "@/pages/(events-manage)/events/[id]/view/calendar/_components/PublishedCalendar.jsx";

export default function ConferenceCalendar({ event, works }) {
  const [selectedWork, setSelectedWork] = useState(null)
  const calendarRef = useRef(null)

  const startDate = event.dates.filter((d) => d.name === 'START_DATE')[0]?.date
  const endDate = event.dates.filter((d) => d.name === 'END_DATE')[0]?.date

  function getEventDates(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) {
      return []
    }
    try {
      const startDate = parseISO(startDateStr)
      const endDate = parseISO(endDateStr)
      return eachDayOfInterval({ start: startDate, end: endDate })
    } catch (error) {
      console.error("Error parsing dates:", error)
      return []
    }
  }

  const handleCloseTalkDetails = () => {
    setSelectedWork(null)
    document.body.style.overflow = 'auto'
  }

  const eventDates = getEventDates(startDate, endDate)
  const firstDateValue = eventDates.length > 0 ? format(eventDates[0], "yyyy-MM-dd") : startDate;
  const [selectedDate, setSelectedDate] = useState(firstDateValue);

  const calendarTabs = eventDates.map(date => {
    const dayOfWeek = format(date, "EEEE", { locale: es });
    const dateOfMonth = format(date, "dd/MM");
    return {
      key: format(date, "yyyy-MM-dd"),
      value: format(date, "yyyy-MM-dd"),
      label: (
        <div className="flex flex-col items-center leading-tight py-1">
          <span className="text-sm font-medium capitalize">{dayOfWeek}</span>
          <span className="text-xs font-normal capitalize">{dateOfMonth}</span>
        </div>
      )
    };
  })

  const handleTabChange = (dateValue) => {
    setSelectedDate(dateValue);
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(dateValue)
    }
  }

  if (!event.mdata.was_published === true) {
    return (
      <ContainerPage>
        <TitlePage title={'Calendario de presentaciones'} />
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">
            El calendario aún no está disponible
          </h2>
          <p className="text-gray-500 mb-4">Será publicado a la brevedad</p>
        </div>
      </ContainerPage>
    )
  }

  return (
    <ContainerPage>
      <div
        className={`max-w-6xl transition-all duration-300 ${selectedWork ? 'mr-[50vw]' : ''}`}
      >
        <div className="mb-6 flex flex-col">
          <TitlePage title={'Calendario de presentaciones'} />
        </div>

        <LineTabs
          tabs={calendarTabs}
          onValueChange={handleTabChange} // Pass the handler
          selected={selectedDate} // Start on the first tab
          centered={true} // Prop to center the tabs
        />

        <div className="-mt-4">
          <PublishedCalendar
            ref={calendarRef} // Assign the ref
            startDate={startDate}
            endDate={endDate}
            eventRooms={event.mdata.rooms || []}
            currentDate={selectedDate}
          />
        </div>

        {selectedWork && (
          <TalkDetails work={selectedWork} onClose={handleCloseTalkDetails} />
        )}
      </div>
    </ContainerPage>
  )
}
