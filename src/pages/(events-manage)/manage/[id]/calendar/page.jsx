import ContainerPage from '@/pages/_components/Containers/ContainerPage.jsx'
import TitlePage from '@/pages/_components/PageStyles/TitlePage.jsx'
import RoomDialog from '@/pages/(events-manage)/manage/[id]/rooms/_components/RoomDialog.jsx'
import CalendarTable from '@/pages/(events-manage)/manage/[id]/calendar/_components/CalendarTable.jsx'

export default function Page({ event }) {
  return (
    <ContainerPage>
      <TitlePage
        title={'Calendario'}
        rightComponent={<RoomDialog/>}
      />
      <div className="space-y-6 pt-6">
        <h1> Hello </h1>
        <h1 className="text-xl font-semibold mb-2"> Betoño troluvi</h1>
        <CalendarTable></CalendarTable>
      </div>
    </ContainerPage>
  )
}