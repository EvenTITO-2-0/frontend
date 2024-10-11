import FetchStatus from '@/components/FetchStatus'
import Page from './page'
import { SPEAKER_ROLE } from '@/lib/Constants'
import { useGetMyWorks } from '@/hooks/events/authorHooks'
import { useGetEvent } from '@/hooks/events/useEventState'

export default function NewPaymentPage() {
  const { data: eventData, isLoading, error } = useGetEvent()
  const isSpeaker = eventData?.roles?.includes(SPEAKER_ROLE)

  const {
    data: worksData,
    isLoading: isWorksLoading,
    error: worksError,
  } = useGetMyWorks({
    enabled: !!isSpeaker,
  })

  const component = <Page eventData={eventData || {}} works={worksData || {}} />

  return (
    <FetchStatus
      component={component}
      isPending={isWorksLoading || isLoading}
      error={worksError || error}
    />
  )
}
