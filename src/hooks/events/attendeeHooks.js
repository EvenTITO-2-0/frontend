import { getEventId } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  apiGetInscriptionPayments,
  apiGetMyInscriptions,
  apiPutInscriptionPayment,
  apiSubmitInscription,
  apiUpdateInscription,
} from '@/services/api/events/inscriptions/queries.js'
import { convertInscription } from '@/services/api/events/inscriptions/conversor.js'
import { uploadFile } from '@/services/api/storage/queries.js'
import { useToastMutation } from '@/hooks/use-toast-mutation.js'

export function useGetMyInscription() {
  const eventId = getEventId()

  return useQuery({
    queryKey: ['getMyInscription', { eventId }],
    queryFn: async () => await getInscriptionWithPayments(eventId),
    onError: (e) => {
      console.error(JSON.stringify(e))
    },
  })
}

export function useSubmitInscription() {
  const eventId = getEventId()
  const queryClient = useQueryClient()

  return useToastMutation(
    async ({ inscriptionData }) => {
      const res = await apiSubmitInscription(eventId, inscriptionData)
      if (inscriptionData.file && res.data.upload_url)
        await uploadFile(res.data.upload_url, inscriptionData.file)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['getMyInscription', { eventId }],
        })
      },
    },
    {
      serviceCode: 'SUBMIT_INSCRIPTION',
    }
  )
}

export function useUpdateInscription() {
  const eventId = getEventId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ inscriptionId, newInscriptionData }) => {
      const res = await apiUpdateInscription(
        eventId,
        inscriptionId,
        newInscriptionData
      )
      await uploadFile(res.data.upload_url, newInscriptionData.file)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getMyInscription', { eventId }],
      })
    },
    onError: (e) => {
      console.error(JSON.stringify(e))
    },
  })
}

export function useNewPayment() {
  const eventId = getEventId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ paymentData }) => {
      const inscription = await queryClient.ensureQueryData({
        queryKey: ['getMyInscription', { eventId }],
        queryFn: async () => await getInscriptionWithPayments(eventId),
      })

      if (paymentData.payment_method === 'mercadopago') {
        return await apiPutInscriptionPayment(
          eventId,
          inscription.id,
          paymentData
        )
      }

      const res = await apiPutInscriptionPayment(
        eventId,
        inscription.id,
        paymentData
      )
      if (paymentData.file) {
        await uploadFile(res.data.upload_url, paymentData.file)
      }
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getMyInscription', { eventId }],
      })
    },
    onError: (e) => {
      console.error(JSON.stringify(e))
    },
  })
}

export async function getInscriptionWithPayments(eventId) {
  const inscription = await apiGetMyInscriptions(eventId)
  const payments = await apiGetInscriptionPayments(eventId, inscription.id)
  return convertInscription(inscription, payments)
}
