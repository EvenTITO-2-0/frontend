import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import StepsForPublish from './_components/StepsForPublish'
import { STARTED_STATUS } from '@/lib/Constants'
import { useNavigator } from '@/lib/navigation'
import { getEventId } from '@/lib/utils'

export default function Page({ eventInfo, inscriptions }) {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const navigator = useNavigator()
  const eventId = getEventId()

  useEffect(() => {
    const linked = searchParams.get('linked')
    if (linked === '1') {
      queryClient.invalidateQueries({
        // fuerza refresh de los datos
        queryKey: ['getEventById', { eventId: eventInfo.id }],
      })
      const newUrl = new URL(window.location)
      newUrl.searchParams.delete('linked')
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams, queryClient, eventInfo.id])

  // Redirect if event is published
  useEffect(() => {
    if (eventInfo.status === STARTED_STATUS) {
      navigator.to(`/manage/${eventId}/info`)
    }
  }, [eventInfo.status, navigator, eventId])

  return (
    <ContainerPage>
      <div className="space-y-6">
        <TitlePage
          title={'Pasos para publicar el evento: ' + eventInfo.title}
        />
        <StepsForPublish eventInfo={eventInfo} />
      </div>
    </ContainerPage>
  )
}
