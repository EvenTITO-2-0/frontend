import { eventsClient } from '../clients'

export const apiGetWorksByTrack = async (
  eventId,
  track,
  limit = 100,
  offset = 0
) => {
  return (await eventsClient.get(`/${eventId}/works`, { track, offset, limit }))
    .data
}

export const apiGetWorkById = async (eventId, workId) => {
  return (await eventsClient.get(`/${eventId}/works/${workId}`)).data
}

export const apiGetSubmissionsForWork = async (eventId, workId) => {
  return (await eventsClient.get(`/${eventId}/works/${workId}/submissions`))
    .data
}

export const apiGetWorkDownloadURL = async (eventId, workId) => {
  return (
    await eventsClient.get(`/${eventId}/works/${workId}/submissions/latest`)
  ).data
}

export const apiGetReviewsForWork = async (eventId, workId) => {
  return (await eventsClient.get(`/${eventId}/works/${workId}/reviews`)).data
}

export const apiGetReviewersForWork = async (eventId, workId) => {
  return (await eventsClient.get(`/${eventId}/reviewers?work_id=${workId}`))
    .data
}

export const apiGetMyWorks = async (eventId) => {
  return (await eventsClient.get(`/${eventId}/works/my-works`)).data
}

export const apiPostWork = async (eventId, work) => {
  return (await eventsClient.post(`/${eventId}/works`, work)).data
}

export const apiPutWork = async (eventId, workId, workUpdate) => {
  return (await eventsClient.put(`/${eventId}/works/${workId}`, workUpdate))
    .data
}

export const apiGetSubmissionUploadUrl = async (eventId, workId) => {
  return (
    await eventsClient.put(`/${eventId}/works/${workId}/submissions/submit`)
  ).data
}

export const apiGetWorksWithTalk = async (eventId) => {
  return (await eventsClient.get(`/${eventId}/works/talks`)).data
}

export const apiGetUnassignedWorks = async (eventId) => {
  return (await eventsClient.get( `/${eventId}/works/unassigned`)).data
}
