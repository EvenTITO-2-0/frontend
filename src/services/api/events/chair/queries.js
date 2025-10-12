import { eventsClient } from '../../clients'

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