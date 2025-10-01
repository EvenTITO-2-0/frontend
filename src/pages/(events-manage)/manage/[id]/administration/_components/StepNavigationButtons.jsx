import { Button } from '@/components/ui/button'
import { useNavigator } from '@/lib/navigation'
import Icon from '@/components/Icon'
import { useEvent } from '@/lib/layout'
import { useState } from 'react'
import { eventsClient } from '@/services/api/clients'
import {
  endDateIsDefined,
  metadataIsDefined,
  pricesAreDefined,
  startDateIsDefined,
  submissionLimitIsDefined,
  tracksAreDefined,
  mercadoPagoIsConnected,
} from './utils'

export default function StepNavigationButtons({
  currentStep,
  eventInfo,
  showNext = true,
  showPrevious = true,
  showReturnToAdmin = true,
}) {
  const navigator = useNavigator()
  const event = useEvent()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const connectWithMercadoPago = async () => {
    try {
      setIsRedirecting(true)
      const { data: url } = await eventsClient.get(
        `/${event.id}/provider/oauth/url`
      )
      window.location.href = url
    } catch (e) {
      console.error('No se pudo obtener URL de OAuth', e)
      setIsRedirecting(false)
    }
  }

  function navigate(to) {
    // Navegación normal para todos los destinos
    navigator.to(`/manage/${event.id}/${to}`)
  }

  // Definir los pasos y sus destinos
  const steps = [
    {
      title: 'Tracks',
      shortTitle: 'Fecha límite y tracks',
      destination: 'tracks',
      condition: () =>
        submissionLimitIsDefined(eventInfo) && tracksAreDefined(eventInfo),
    },
    {
      title: 'Información',
      shortTitle: 'Información general',
      destination: 'basic-config',
      condition: () => metadataIsDefined(eventInfo),
    },
    {
      title: 'Tarifas',
      shortTitle: 'Configurar tarifas',
      destination: 'pricing',
      condition: () => pricesAreDefined(eventInfo),
    },
    {
      title: 'Administración',
      shortTitle: 'Mercado Pago',
      destination: 'administration',
      condition: () => mercadoPagoIsConnected(eventInfo),
    },
  ]

  const currentStepIndex = steps.findIndex(
    (step) => step.destination === currentStep
  )
  const nextStep = steps[currentStepIndex + 1]
  const previousStep = steps[currentStepIndex - 1]

  return (
    <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            {showPrevious && previousStep && (
              <Button
                variant="outline"
                onClick={() => navigate(previousStep.destination)}
                className="flex items-center gap-2"
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
                {previousStep.shortTitle}
              </Button>
            )}

            {showReturnToAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('administration')}
                className="flex items-center gap-2"
              >
                <Icon name="List" className="w-4 h-4" />
                Ver todos los pasos
              </Button>
            )}
          </div>

          {showNext && nextStep && (
            <Button
              onClick={() => {
                if (nextStep.destination === 'administration') {
                  // Si el siguiente paso es administración, conectar con Mercado Pago
                  connectWithMercadoPago()
                } else {
                  // Para otros pasos, navegar normalmente
                  navigate(nextStep.destination)
                }
              }}
              className="flex items-center gap-2"
              disabled={isRedirecting}
            >
              {isRedirecting && nextStep.destination === 'administration'
                ? 'Conectando...'
                : nextStep.shortTitle}
              <Icon name="ChevronRight" className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
