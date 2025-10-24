import { useGetEvent } from '@/hooks/events/useEventState'
import { useHasMyInscription } from '@/hooks/events/attendeeHooks'
import FetchStatus from '@/components/FetchStatus'
import Page from './page'

export default function EventViewPage() {
  const { data: event, isPending, error } = useGetEvent()
  const { data: hasInscription } = useHasMyInscription()

  const component = (
    <Page eventInfo={event} activeRegistration={!hasInscription} />
  )

  return (
    <FetchStatus component={component} isPending={isPending} error={error} />
  )
}
