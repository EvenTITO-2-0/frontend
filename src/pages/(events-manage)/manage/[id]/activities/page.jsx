import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import { useEditEvent } from '@/hooks/manage/generalHooks'
import ConfigurationDates from './_components/ConfigurationDates'
import CalendarTable from './_components/CalendarTable'
import { useEffect, useState } from 'react'

export default function Page({ event }) {
  const startDate = event.dates.filter((d) => d.name === 'START_DATE')[0]?.date
  const endDate = event.dates.filter((d) => d.name === 'END_DATE')[0]?.date
  const informativeDates = event.mdata?.informative_dates || []
  const [eventStatus, setEventStatus] = useState(event.status || null)
  const [slots, setSlots] = useState(event.mdata?.slots || [])

  const { mutateAsync: submitEditEvent, isPending } = useEditEvent()

  // Actualizar estado si es que existe
  useEffect(() => {
    async function fetchStatus() {
      if (!event.status && event.id) {
        // Replace with your actual API call to get status
        const res = await fetch(`/api/events/${event.id}/status`)
        const data = await res.json()
        setEventStatus(data.status)
      }
    }
    fetchStatus()
  }, [event])

  async function onAddNewDate({ newDate }) {
    let eventCopy = { ...event }
    delete eventCopy.title
    if (!eventCopy.mdata.informative_dates) {
      eventCopy.mdata.informative_dates = []
    }
    eventCopy.mdata.informative_dates.push(newDate)
    console.log('newDate: ' + JSON.stringify(newDate))
    console.log('eventCopy: ' + JSON.stringify(eventCopy))
    await submitEditEvent({ eventData: eventCopy })
  }

  async function onEditDate({ newDate, nameDate }) {
    let eventCopy = { ...event }
    delete eventCopy.title
    eventCopy.dates = eventCopy.dates.map((d) =>
      d.name === nameDate ? { ...d, date: newDate } : d
    )

    await submitEditEvent({ eventData: eventCopy })
  }

  async function onEditStartDate({ newDate }) {
    await onEditDate({ newDate: newDate, nameDate: 'START_DATE' })
  }
  async function onEditEndDate({ newDate }) {
    await onEditDate({ newDate: newDate, nameDate: 'END_DATE' })
  }

  async function onEditActivity({ newDate, oldTitle }) {
    let eventCopy = { ...event }
    delete eventCopy.title
    eventCopy.mdata.informative_dates = eventCopy.mdata.informative_dates.map(
      (d) => (d.title === oldTitle ? { ...newDate } : d)
    )

    await submitEditEvent({ eventData: eventCopy })
  }

  async function onAddNewSlot(newSlot) {
    let eventCopy = { ...event }
    if (!eventCopy.mdata) eventCopy.mdata = {}
    if (!eventCopy.mdata.slots) eventCopy.mdata.slots = []
    // Add or update slot
    const idx = eventCopy.mdata.slots.findIndex((s) => s.id === newSlot.id)
    if (idx > -1) {
      eventCopy.mdata.slots[idx] = newSlot
    } else {
      eventCopy.mdata.slots.push(newSlot)
    }
    setSlots([...eventCopy.mdata.slots])
    await submitEditEvent({ eventData: eventCopy })
  }

  return (
    <ContainerPage>
      <div className="space-y-6">
        <TitlePage title={'Actividades del evento'} />
        <ConfigurationDates
          startDate={startDate}
          endDate={endDate}
          onEditStartDate={onEditStartDate}
          onEditEndDate={onEditEndDate}
        />
        <CalendarTable
          startDate={startDate}
          endDate={endDate}
          onAddNewSlot={onAddNewSlot}
          slots={slots}
          eventStatus={eventStatus}
        />
      </div>
    </ContainerPage>
  )
}
