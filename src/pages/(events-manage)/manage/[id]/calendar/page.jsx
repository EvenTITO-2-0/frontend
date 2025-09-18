import ContainerPage from '@/pages/_components/Containers/ContainerPage.jsx'
import TitlePage from '@/pages/_components/PageStyles/TitlePage.jsx'
import RoomDialog from '@/pages/(events-manage)/manage/[id]/rooms/_components/RoomDialog.jsx'
import CalendarTable from '@/pages/(events-manage)/manage/[id]/calendar/_components/CalendarTable.jsx'
import {useEditEvent} from "@/hooks/manage/generalHooks.js";

export default function Page({ event }) {
  const startDate = event.dates.filter((d) => d.name === 'START_DATE')[0]?.date
  const endDate = event.dates.filter((d) => d.name === 'END_DATE')[0]?.date
  const { mutateAsync: submitEditEvent, isPending } = useEditEvent()

  async function onAddNewSlot({ slot }) {
    let eventCopy = { ...event }
    //delete eventCopy.title
    // if (!eventCopy.mdata.informative_dates) {
    //   eventCopy.mdata.informative_dates = []
    // }
    // eventCopy.mdata.informative_dates.push(newDate)
    console.log('slot: ' + JSON.stringify(slot))
    console.log('eventCopy: ' + JSON.stringify(eventCopy))
    await submitEditEvent({ eventData: eventCopy })
  }

  return (
    <ContainerPage>
      <TitlePage title={'Calendario'} rightComponent={<RoomDialog />} />
      <div className="space-y-6 pt-6">
        <p>
          En esta página puedes configurar el calendario del evento. Los
          elementos disponibles son:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Slots:</strong> Espacios para asignar presentaciones de
            nuevos trabajos.
          </li>
          <li>
            <strong>Plenarias:</strong> Presentaciones únicas que bloquean otras
            salas.
          </li>
          <li>
            <strong>Breaks:</strong> Descansos sin presentaciones en ninguna
            sala.
          </li>
        </ul>
        <h2 className="text-xl font-semibold mb-2">Agregar nuevo item</h2>
        <CalendarTable startDate={startDate} endDate={endDate} onAddNewSlot={onAddNewSlot}/>
      </div>
    </ContainerPage>
  )
}
