import { getEventId } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFile } from '@/services/api/storage/queries.js'
import {
  apiGetUploadEventImageUrl,
  apiUpdateEventStatus,
  apiUpdateGeneralEvent,
} from '@/services/api/events/general/queries'
import { useToastMutation } from '@/hooks/use-toast-mutation.js'

export function useEditEvent() {
  const eventId = getEventId()

  const queryClient = useQueryClient()

  return useToastMutation(
    async ({ eventData }) => {
      await apiUpdateGeneralEvent(eventId, { ...eventData })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['getEventById', { eventId }],
        })
      },
    },
    {
      serviceCode: 'EDIT_EVENT',
      duration: 2000,
    }
  )
}

export function useUploadEventImage() {
  const eventId = getEventId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imageName, image }) =>
      await uploadEventImage(eventId, imageName, image),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getEventById', { eventId }],
      })
    },
  })
}

async function uploadEventImage(eventId, imageName, image) {
  if (image) {
    const uploadUrl = await apiGetUploadEventImageUrl(eventId, imageName)
    await uploadFile(uploadUrl, image)
  }
}

export function useUpdateEventStatus() {
  const eventId = getEventId()
  const queryClient = useQueryClient()

  return useToastMutation(
    async ({ newStatus }) => {
      await apiUpdateEventStatus(eventId, { status: newStatus })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['getEventById', { eventId }],
        })
      },
    },
    {
      serviceCode: 'UPDATE_EVENT_STATUS',
    }
  )
}
