import { useEffect, useState } from 'react'
import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import {
  useAddChairToTrack,
  useAddTrack,
  useDeleteChairOfTrack,
  useUpdateTracks,
} from '@/hooks/manage/tracksHooks'
import { unifyEventTracksWithChairs } from './_components/utils.js'
import { CREATED_STATUS } from '@/lib/Constants.js'
import TracksTable from './_components/TracksTable'
import StepNavigationButtons from '../administration/_components/StepNavigationButtons'
import AddTrackButton from './_components/AddTrackButton'
import { useEditEvent } from '@/hooks/manage/generalHooks'
import DateCard from '@/components/Card/DateCard.jsx'
import GoToReviewFormCard from './_components/GoToReviewFormCard.jsx'

export default function Page({
  event,
  chairs,
  tracksByChair,
  chairsDataPending,
}) {
  const tracks = unifyEventTracksWithChairs(event.tracks, tracksByChair).map(
    (track, index) => ({
      ...track,
      id: index,
    })
  )
  const addChairToTrack = useAddChairToTrack()
  const deleteChairOfTrack = useDeleteChairOfTrack()
  const addTrack = useAddTrack()
  const updateTracks = useUpdateTracks()
  const canAddOrRemoveTracks = event.status === CREATED_STATUS
  const { mutateAsync: submitEditEvent, isPending } = useEditEvent()

  const submissionDate = event.dates.filter(
    (d) => d.name === 'SUBMISSION_DEADLINE_DATE'
  )[0]?.date

  async function onEditSubmissionDate({ newDate }) {
    let eventCopy = { ...event }
    delete eventCopy.title
    eventCopy.dates = eventCopy.dates.map((d) =>
      d.name === 'SUBMISSION_DEADLINE_DATE' ? { ...d, date: newDate } : d
    )

    await submitEditEvent({ eventData: eventCopy })
  }

  function getUserIdByEmail(email) {
    return chairs.filter((chair) => chair.email === email)[0]?.userId
  }

  async function onDeleteChair(track, email) {
    const userId = getUserIdByEmail(email)
    await deleteChairOfTrack.mutateAsync({ track: track, userId: userId })
  }

  async function onAddChair(track, email) {
    const userId = getUserIdByEmail(email)
    await addChairToTrack.mutateAsync({ track: track, userId: userId })
  }

  const handleAddTrack = async (newTrack) => {
    await addTrack.mutateAsync({
      eventTracks: tracks.map((track) => track.track),
      track: newTrack,
    })
  }

  const handleDeleteTrack = async (trackToDelete) => {
    if (!trackToDelete) return

    if (trackToDelete.mail) {
      await onDeleteChair(trackToDelete.track, trackToDelete.mail)
    }
    const updatedTracks = tracks.filter((t) => t.track !== trackToDelete.track)
    await updateTracks.mutateAsync({
      tracks: updatedTracks.map((t) => t.track),
    })
  }

  return (
    <ContainerPage>
      <div className="space-y-6">
        <DateCard
          date={submissionDate}
          onEdit={onEditSubmissionDate}
          label="Fecha límite de recepción de trabajos"
        />
        <GoToReviewFormCard />
        <TracksTable
          tracks={tracks}
          chairs={chairs}
          onAddChair={onAddChair}
          onDeleteChair={onDeleteChair}
          onDeleteTrack={handleDeleteTrack}
          eventIsPublic={!canAddOrRemoveTracks}
          addTrackButton={
            <AddTrackButton
              onSave={handleAddTrack}
              isLoading={addTrack.isPending}
            />
          }
          isPending={chairsDataPending}
        />
        {canAddOrRemoveTracks && tracks.length > 0 ? (
          <AddTrackButton
            onSave={handleAddTrack}
            isLoading={addTrack.isPending}
          />
        ) : null}
        <StepNavigationButtons currentStep="tracks" eventInfo={event} />
      </div>
    </ContainerPage>
  )
}
