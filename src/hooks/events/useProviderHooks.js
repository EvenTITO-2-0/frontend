import { useMutation, useQuery } from '@tanstack/react-query'
import { eventsClient } from '@/services/api/clients'

export const useLinkProviderAccount = (eventId) => {
  return useMutation({
    mutationFn: async (accountData) => {
      const response = await eventsClient.post(
        `/${eventId}/provider/link`,
        accountData
      )
      return response.data
    },
  })
}

export const useGetProviderStatus = (eventId) => {
  return useQuery({
    queryKey: ['provider-status', eventId],
    queryFn: async () => {
      const response = await eventsClient.get(`/${eventId}/provider/status`)
      return response.data
    },
    enabled: !!eventId,
  })
}
