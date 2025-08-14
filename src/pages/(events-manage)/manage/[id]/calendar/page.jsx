import ContainerPage from '@/pages/_components/Containers/ContainerPage.jsx'
import TitlePage from '@/pages/_components/PageStyles/TitlePage.jsx'
import RoomDialog from '@/pages/(events-manage)/manage/[id]/rooms/_components/RoomDialog.jsx'
import CalendarTable from '@/pages/(events-manage)/manage/[id]/calendar/_components/CalendarTable.jsx'

export default function Page({ event }) {
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
        <CalendarTable />
      </div>
    </ContainerPage>
  )
}
