import { useUpdateEventStatus } from '@/hooks/manage/generalHooks'
import { STARTED_STATUS } from '@/lib/Constants'
import { Button } from '@nextui-org/button'
import { useNavigator } from '@/lib/navigation'
import { useEvent } from '@/lib/layout'

export default function PublishEventButton({ conditionsMet }) {
  const { mutateAsync: updateEventStatus, isPending } = useUpdateEventStatus()
  const navigator = useNavigator()
  const event = useEvent()

  async function publishEvent() {
    await updateEventStatus({ newStatus: STARTED_STATUS })
    navigator.to(`/manage/${event.id}/info`)
  }

  return (
    <Button
      color="primary"
      className="w-full"
      onPress={publishEvent}
      isLoading={isPending}
      isDisabled={!conditionsMet}
    >
      {isPending ? (
        <p>Publicando evento...</p>
      ) : conditionsMet ? (
        <p>Publicar evento</p>
      ) : (
        <p>Publicar evento</p>
      )}
    </Button>
  )
}
