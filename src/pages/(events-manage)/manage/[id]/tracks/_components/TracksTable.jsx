import { TableRow, TableCell } from '@nextui-org/table'
import TableWithPagination from '@/components/Table/TableWithPagination'
import TrackActions from './TrackActions'
import { SkeletonTable } from '@/components/Skeleton'

export default function TracksTable({
  tracks,
  chairs,
  onAddChair,
  onDeleteChair,
  onDeleteTrack,
  isPending,
  eventIsPublic,
  addTrackButton,
}) {
  if (isPending) {
    return <SkeletonTable />
  }

  async function addChair(track, newEmail) {
    await onAddChair(track, newEmail)
  }

  async function changeChair(track, oldEmail, newEmail) {
    await onDeleteChair(track, oldEmail)
    await onAddChair(track, newEmail)
  }

  async function deleteTrack(track) {
    await onDeleteTrack(track)
  }

  if (tracks.length === 0)
    return <EmptyTracksPage addTrackButton={addTrackButton} />

  const columns = ['TRACK', 'CHAIR', 'ACCIONES']

  const renderRow = (track, index) => (
    <TableRow key={index}>
      <TableCell>{track.track}</TableCell>
      <TableCell>
        {track.mail ? (
          <p>{track.mail}</p>
        ) : (
          <p className="text-gray-500 italic">Sin chair asignado</p>
        )}
      </TableCell>
      <TableCell>
        <TrackActions
          track={track}
          chairs={chairs}
          addChair={addChair}
          changeChair={changeChair}
          deleteTrack={deleteTrack}
          eventIsPublic={eventIsPublic}
        />
      </TableCell>
    </TableRow>
  )

  return (
    <TableWithPagination
      columns={columns}
      completeItems={tracks}
      renderRow={renderRow}
    />
  )
}

function EmptyTracksPage({ addTrackButton }) {
  return (
    <div className="text-center py-10">
      <h2 className="text-xl font-semibold mb-2">Ningún track cargado</h2>
      <p className="text-gray-500 mb-4">
        Debe configurar al menos un track
        para publicar el evento.
      </p>
      {addTrackButton}
    </div>
  )
}
