import { eventsClient } from '../../clients'
import {useAssignWorksMutation, useDeleteRoomsMutation} from "@/hooks/events/chairHooks.js";

export const apiGetEventChairs = async (eventId) => {
  return (await eventsClient.get(`/${eventId}/chairs`)).data
}

export const apiGetMyEventChair = async (eventId) => {
  return (await eventsClient.get(`/${eventId}/chairs/me`)).data
}

export const apiGetEventChair = async (eventId, userId) => {
  return (await eventsClient.get(`/${eventId}/chairs/${userId}`)).data
}

export const apiUpdateChairTracks = async (eventId, userId, tracksUpdate) => {
  return await eventsClient.put(
    `/${eventId}/chairs/${userId}/tracks`,
    tracksUpdate
  )
}

export const apiUpdateTracks = async (eventId, tracks) => {
  return await eventsClient.put(
    `/${eventId}/configuration/general/tracks`,
    tracks
  )
}

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