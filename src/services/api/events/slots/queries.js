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

export const apiAssignWorks = async (eventId, parameters) => {
  return await eventsClient.post(
      `/${eventId}/configuration/slots/assign`,
      parameters
  )
}

export const apiGetSlotsWithWorks = async (eventId) => {
  const response = await eventsClient.get(
      `/${eventId}/configuration/slots/works`
  )
  return response.data;
}

export const apiDeleteWorkSlot = async (eventId, work_id) => {
  const response = await eventsClient.delete(
      `/${eventId}/configuration/slots/works/${work_id}`
  )
  return response.data;
}

export const apiAssignWorkToSlot = async (eventId, work_id, slot_id) => {
  const response = await eventsClient.patch(
      `/${eventId}/configuration/slots/${slot_id}/works/${work_id}`,
  )
  return response.data;
}
