import { eventsClient } from '../../clients'

export const apiGenerateFromPlantilla = async (eventId) => {
  return await eventsClient.get(
    `/${eventId}/configuration/slots`
  )
}

export const apiDeleteRooms = async (eventId) => {
  return await eventsClient.delete(
      `/${eventId}/configuration/slots`
  )
}

export const apiCreateSlot = async (eventId, slot) => {
  return await eventsClient.post(
      `/${eventId}/configuration/slots`,
    slot
  )
}

export const apiUpdateSlot = async (eventId, slotId, slot) => {
  return await eventsClient.put(
      `/${eventId}/configuration/slots/${slotId}`,
      slot
  )
}

export const apiDeleteSlot = async (eventId, slotId) => {
  return await eventsClient.delete(
      `/${eventId}/configuration/slots/${slotId}`
  )
}

export const apiAssignWorks = async (eventId) => {
  return await eventsClient.get(
      `/${eventId}/configuration/slots/assign`
  )
}

export const apiGetSlotsWithWorks = async (eventId) => {
  const response = await eventsClient.get(
      `/${eventId}/configuration/slots/works`
  )
  return response.data;
}