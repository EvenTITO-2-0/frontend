import Page from './page'
import { useEvent } from '@/lib/layout'
import { useGetInscriptions } from '@/hooks/manage/inscriptionHooks'
import { APPROVED_STATUS, ATTENDEE_ROLE } from '@/lib/Constants'

export default function InfoConfigPage() {
  const eventData = useEvent()
  const { data: inscriptions, isPending, error } = useGetInscriptions()
  let attendees = 0

  if (inscriptions) {
    attendees = inscriptions.filter(
      (inscription) =>
        inscription.status === APPROVED_STATUS &&
        inscription.roles.includes(ATTENDEE_ROLE)
    ).length
  }

  return (
    <Page
      eventInfo={eventData}
      inscriptions={{
        isPending: isPending,
        attendees: attendees,
      }}
    />
  )
}
