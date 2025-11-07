import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import { useEditEvent } from '@/hooks/manage/generalHooks'
import ConfigurationDates from './_components/ConfigurationDates'
import CalendarTemplateTable from './_components/CalendarTemplateTable'
import React, { useEffect, useState } from 'react'
import SetCalendarDialog from '@/pages/(events-manage)/manage/[id]/activities/_components/SetCalendarDialog.jsx'
import CalendarTable from '@/pages/(events-manage)/manage/[id]/activities/_components/CalendarTable.jsx'
import SetDeleteDialog from "@/pages/(events-manage)/manage/[id]/activities/_components/SetDeleteDialog.jsx";
import AssignDialog from "@/pages/(events-manage)/manage/[id]/activities/_components/AssignDialog.jsx";
import Icon from '@/components/Icon.jsx'
import SetRemoveAllAssignmentsDialog
  from '@/pages/(events-manage)/manage/[id]/activities/_components/SetRemoveAllAssignmentsDialog.jsx'
import { parseISO, addDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns'

export default function Page({ event }) {
  const eventRooms = event.mdata?.rooms || []
  const startDate = event.dates.filter((d) => d.name === 'START_DATE')[0]?.date
  const endDate = event.dates.filter((d) => d.name === 'END_DATE')[0]?.date
  const [eventStatus, setEventStatus] = useState(event.status || null)
  const [mdataSlots, setMdataSlots] = useState(event.mdata.slots || [])
  const [eventSlots, setEventSlots] = useState(event.event_slots || [])
  const { mutateAsync: submitEditEvent, isPending } = useEditEvent()
  console.log(event)
  const wasConfigured = event.mdata?.was_configured

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

  useEffect(() => {
    setEventSlots(event.event_slots || [])
  }, [event.event_slots])

  async function onEditDate({ newDate, nameDate }) {
    let eventCopy = { ...event }
    delete eventCopy.title
    eventCopy.dates = eventCopy.dates.map((d) =>
      d.name === nameDate ? { ...d, date: newDate } : d
    )

    await submitEditEvent({ eventData: eventCopy })
  }

  async function onEditStartDate({ newDate }) {
    const newStartDay = startOfDay(parseISO(newDate))
    const hasEarlierSlot = mdataSlots.some(slot => {
      const slotStart = parseISO(slot.start)
      return isBefore(slotStart, newStartDay)
    })

    if (hasEarlierSlot) {
      toast.error('No se puede actualizar la fecha de inicio.', {
        description: 'Existen actividades programadas antes de la nueva fecha de inicio.',
      })
      return
    }
    await onEditDate({ newDate: newDate, nameDate: 'START_DATE' })
  }

  async function onEditEndDate({ newDate }) {
    const boundaryTime = addDays(startOfDay(parseISO(newDate)), 1)

    const hasLaterSlot = mdataSlots.some(slot => {
      const slotEnd = parseISO(slot.end)
      return isAfter(slotEnd, boundaryTime) || isEqual(slotEnd, boundaryTime)
    })

    if (hasLaterSlot) {
      toast.error('No se puede actualizar la fecha de fin.', {
        description: 'Existen actividades programadas después de la nueva fecha de fin.',
      })
      return
    }
    await onEditDate({ newDate: newDate, nameDate: 'END_DATE' })
  }

  async function onAddNewSlot(newSlot) {
    let eventCopy = { ...event }
    if (!eventCopy.mdata) eventCopy.mdata = {}
    if (!eventCopy.mdata.slots) eventCopy.mdata.slots = []
    const idx = eventCopy.mdata.slots.findIndex((s) => s.id === newSlot.id)
    if (idx > -1) {
      eventCopy.mdata.slots[idx] = newSlot
    } else {
      eventCopy.mdata.slots.push(newSlot)
    }
    setMdataSlots([...eventCopy.mdata.slots])
    await submitEditEvent({ eventData: eventCopy })
  }

  async function onDeleteSlot(slotIdToDelete) {
    let eventCopy = { ...event }
    if (!eventCopy.mdata || !eventCopy.mdata.slots) {
      console.warn('Cannot delete slot: mdata.slots is not initialized.')
      return
    }
    const updatedSlots = eventCopy.mdata.slots.filter(
        (slot) => slot.id !== slotIdToDelete
    )
    eventCopy.mdata.slots = updatedSlots
    setMdataSlots(updatedSlots)
    await submitEditEvent({ eventData: eventCopy })
  }

  return (
    <ContainerPage>
      <div className="space-y-6">
        <TitlePage
          title={'Actividades del evento'}
          rightComponent={
            wasConfigured ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SetDeleteDialog />
                <SetRemoveAllAssignmentsDialog />
                <AssignDialog />
              </div>
            ) : (
              <SetCalendarDialog eventRooms={eventRooms} />
            )
          }
        />
        {wasConfigured ? (
          <CalendarTable
            eventId={event.id}
            startDate={startDate}
            endDate={endDate}
            eventSlots={eventSlots}
            eventRooms={eventRooms}
            eventStatus={eventStatus}
          />
        ) : (
          <>
            <ConfigurationDates
              startDate={startDate}
              endDate={endDate}
              onEditStartDate={onEditStartDate}
              onEditEndDate={onEditEndDate}
            />
            {(!startDate || !endDate) ? (
              <NoDatesMessage />
            ) : (
              <CalendarTemplateTable
                startDate={startDate}
                endDate={endDate}
                onAddNewSlot={onAddNewSlot}
                onDeleteSlot={onDeleteSlot}
                slots={mdataSlots}
                eventStatus={eventStatus}
              />
            )}
          </>
        )}
      </div>
    </ContainerPage>
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
