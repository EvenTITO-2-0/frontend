import { HTTPClient } from '../HTTPClient'

// Crear una instancia del cliente HTTP específica para eventos
export const eventsClient = new HTTPClient('/api/events')

// Opcionalmente, puedes agregar interceptores específicos para eventos aquí
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
    // Manejar errores específicos de eventos aquí
    return Promise.reject(error)
  }
)
