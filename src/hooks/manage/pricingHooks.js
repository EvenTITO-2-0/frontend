import { getEventId } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  apiUpdateDatesEvent,
  apiUpdatePricingEvent,
} from '@/services/api/events/general/queries.js'
import {
  convertFares,
  convertNewDates,
  convertNewPricing,
  convertUpdateDates,
  convertUpdatePricing,
} from '@/services/api/events/general/conversor.js'
import { useToastMutation } from '@/hooks/use-toast-mutation.js'

export function useAddOrModifyFareInEventPricing() {
  const eventId = getEventId()
  const queryClient = useQueryClient()

  return useToastMutation(
    async ({ newFare, eventPrices, eventDates }) => {
      if (newFare.related_date) {
        let updatedDates
        if (eventDates.some((d) => d.name === newFare.related_date.name)) {
          updatedDates = convertUpdateDates(eventDates, newFare.related_date)
        } else {
          updatedDates = convertNewDates(eventDates, newFare.related_date)
        }
        await apiUpdateDatesEvent(eventId, updatedDates)
      }

      let updatedPricing
      if (eventPrices.some((fare) => fare.name === newFare.name)) {
        updatedPricing = convertUpdatePricing(eventPrices, newFare)
      } else {
        updatedPricing = convertNewPricing(eventPrices, newFare)
      }
      return await apiUpdatePricingEvent(eventId, updatedPricing)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['getEventById', { eventId }],
        })
        queryClient.invalidateQueries({
          queryKey: ['provider-status', eventId],
        })
      },
    },
    {
      serviceCode: 'EDIT_FARE',
    }
  )
}

export function useDeletePayment() {
  const eventId = getEventId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fareName, eventPricing }) => {
      const updatedFares = eventPricing.filter((p) => p.name !== fareName)
      const faresConverted = convertFares(updatedFares)
      return await apiUpdatePricingEvent(eventId, faresConverted)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getEventById', { eventId }],
      })
      queryClient.invalidateQueries({
        queryKey: ['provider-status', eventId],
      })
    },
  })
}
