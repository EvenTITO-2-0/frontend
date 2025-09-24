import { useUpdateEventStatus } from '@/hooks/manage/generalHooks'
import { STARTED_STATUS } from '@/lib/Constants'
import { Button } from '@nextui-org/button'

export default function PublishEventButton({ conditionsMet }) {
  const { mutateAsync: updateEventStatus, isPending } = useUpdateEventStatus()

  async function publishEvent() {
    await updateEventStatus({ newStatus: STARTED_STATUS })
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
