import { HTTPClient } from '../HTTPClient'

export const eventsClient = new HTTPClient('/api/events')

eventsClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

eventsClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)
