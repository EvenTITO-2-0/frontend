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
  console.log('useGetProviderStatus - Hook called with eventId:', eventId)

  return useQuery({
    queryKey: ['provider-status', eventId],
    queryFn: async () => {
      console.log(
        'useGetProviderStatus - Fetching provider status for eventId:',
        eventId
      )
      try {
        const response = await eventsClient.get(`/${eventId}/provider/status`)
        console.log(
          'useGetProviderStatus - Provider status response:',
          response.data
        )
        return response.data
      } catch (error) {
        console.error(
          'useGetProviderStatus - Error fetching provider status:',
          error
        )
        throw error
      }
    },
    enabled: !!eventId,
    staleTime: 30000,
    cacheTime: 60000,
  })
}
