import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import { useEditEvent } from '@/hooks/manage/generalHooks'
import Activities from './_components/Activities'
import ConfigurationDates from './_components/ConfigurationDates'

export default function Page({ event }) {
  const startDate = event.dates.filter((d) => d.name === 'START_DATE')[0]?.date
  const endDate = event.dates.filter((d) => d.name === 'END_DATE')[0]?.date
  const informativeDates = event.mdata?.informative_dates || []

  const { mutateAsync: submitEditEvent, isPending } = useEditEvent()

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
        <Activities
          startDate={startDate}
          endDate={endDate}
          informativeDates={informativeDates}
          onAddNewDate={onAddNewDate}
          onEditDate={onEditActivity}
        />
      </div>
    </ContainerPage>
  )
}
