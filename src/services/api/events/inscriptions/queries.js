import { eventsClient } from '../../clients'

export const apiGetMyInscriptions = async (eventId) => {
  return (await eventsClient.get(`/${eventId}/inscriptions/my-inscription`))
    .data
}

export const apiUpdateInscription = async (eventId, inscriptionId, body) => {
  return await eventsClient.put(
    `/${eventId}/inscriptions/${inscriptionId}`,
    body
  )
}

export const apiGetInscriptionPayments = async (eventId, inscriptionId) => {
  return (
    await eventsClient.get(`/${eventId}/inscriptions/${inscriptionId}/payments`)
  ).data
}

export const apiSubmitInscription = async (eventId, body) => {
  return await eventsClient.post(`/${eventId}/inscriptions`, body)
}

export const apiPutInscriptionPayment = async (
  eventId,
  inscriptionId,
  body
) => {
  return await eventsClient.put(
    `/${eventId}/inscriptions/${inscriptionId}/pay`,
    body
  )
}

export const apiGetInscriptions = async (eventId) => {
  return (await eventsClient.get(`/${eventId}/inscriptions`)).data
}

export const apiGetPayments = async (eventId) => {
  return (await eventsClient.get(`/${eventId}/payments`)).data
}

export const apiUpdateInscriptionStatus = async (
  eventId,
  inscriptionId,
  update
) => {
  return await eventsClient.patch(
    `/${eventId}/inscriptions/${inscriptionId}`,
    update
  )
}

export const apiUpdatePaymentStatus = async (eventId, paymentId, update) => {
  return await eventsClient.patch(`/${eventId}/payments/${paymentId}`, update)
}

export const apiGetPaymentCheckoutUrl = async (
  eventId,
  inscriptionId,
  paymentId
) => {
  return (
    await eventsClient.get(
      `/${eventId}/inscriptions/${inscriptionId}/payments/${paymentId}/checkout-url`
    )
  ).data
}
