import CardWithFocus from '@/components/Card/CardWithFocus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import RegistrationForm from './RegistrationForm'
import { format } from '@formkit/tempo'
import { useEffect, useState } from 'react'
import { useNavigator } from '@/lib/navigation'
import { SPEAKER_ROLE } from '@/lib/Constants'
import { useGetMyInscription } from '@/hooks/events/attendeeHooks'
import { useGetMyWorks } from '@/hooks/events/authorHooks'

export default function RegistrationCards({
  startDate,
  submissionLimit,
  eventTitle,
  eventId,
  activeRegistration,
  inscriptionSuccess,
  setInscriptionSuccess,
  prices = [],
}) {
  return (
    <div>
      <RegistrationCard
        open={{
          title: 'Inscripciones abiertas para asistir al evento',
          description: 'Haz click para ir al formulario de inscripción',
        }}
        close={{
          title: 'Inscripciones cerradas para asistir al evento',
        }}
        isOpen={new Date() < startDate}
        limitDate={startDate}
        eventTitle={eventTitle}
        speakerDisabled={new Date() >= submissionLimit}
        eventId={eventId}
        activeRegistration={activeRegistration}
        inscriptionSuccess={inscriptionSuccess}
        setInscriptionSuccess={setInscriptionSuccess}
        prices={prices}
      />
      <RegistrationCard
        open={{
          title: 'Perído de presentación de trabajos abierto',
          description:
            'Presenta tu trabajo (requiere estar inscripto como Autor).',
        }}
        close={{
          title: 'Período de presentación de trabajos cerrado',
        }}
        limitDate={submissionLimit}
        isOpen={new Date() < submissionLimit}
        eventTitle={eventTitle}
        speakerDisabled={new Date() >= submissionLimit}
        eventId={eventId}
        activeRegistration={activeRegistration}
        inscriptionSuccess={inscriptionSuccess}
        setInscriptionSuccess={setInscriptionSuccess}
        prices={prices}
        isSubmissionCard
      />
    </div>
  )
}

function RegistrationCard({
  open,
  close,
  isOpen,
  limitDate,
  eventTitle,
  speakerDisabled,
  eventId,
  activeRegistration,
  inscriptionSuccess,
  setInscriptionSuccess,
  prices = [],
  isSubmissionCard = false,
}) {
  const navigator = useNavigator()

  // Datos de usuario para decidir flujo del segundo botón (presentación de trabajo)
  const hasInscription = !activeRegistration
  const { data: myInscription } = useGetMyInscription()
  const { data: myWorks } = useGetMyWorks()
  const isSpeaker = Array.isArray(myInscription?.roles)
    ? myInscription.roles.includes(SPEAKER_ROLE)
    : false
  const hasApprovedPayment = Array.isArray(myInscription?.payments)
    ? myInscription.payments.some((p) => p.status === 'APPROVED')
    : false

  useEffect(() => {
    if (inscriptionSuccess) {
      navigator.to(`/events/${eventId}/view`)
    }
  }, [inscriptionSuccess])

  function trigger(onOpen) {
    const headerTitle = isOpen ? open.title : close.title

    // Card informativa con botón explícito
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{headerTitle}</CardTitle>
          <LimitDate limitDate={limitDate} isOpen={isOpen} />
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-muted-foreground">
            {isSubmissionCard
              ? 'Presenta trabajos durante el período habilitado.'
              : 'Completa tu inscripción para participar del evento.'}
          </p>
          {renderPrimaryAction(onOpen)}
        </CardContent>
      </Card>
    )
  }

  function renderPrimaryAction(onOpen) {
    if (!isSubmissionCard) {
      // Botón de Inscripción
      if (!isOpen) {
        return (
          <Button disabled variant="secondary">
            Inscripciones cerradas
          </Button>
        )
      }
      if (!activeRegistration) {
        return (
          <Button
            onClick={() => navigator.to(`/events/${eventId}/roles/attendee`)}
          >
            Ver mi inscripción
          </Button>
        )
      }
      return <Button onClick={onOpen}>Inscribirme</Button>
    }

    // Botón de Presentar trabajo
    if (!isOpen) {
      return (
        <Button disabled variant="secondary">
          Período cerrado
        </Button>
      )
    }
    if (hasApprovedPayment && !isSpeaker) {
      return (
        <Button disabled variant="secondary">
          Inscripción finalizada
        </Button>
      )
    }
    if (!hasInscription) {
      return (
        <Button
          onClick={() => navigator.to(`/events/${eventId}/view`)}
          variant="outline"
        >
          Debes inscribirte primero
        </Button>
      )
    }
    if (!isSpeaker) {
      return (
        <Button
          onClick={() => navigator.to(`/events/${eventId}/roles/attendee`)}
          variant="outline"
        >
          Agregar rol Autor en mi inscripción
        </Button>
      )
    }
    const hasAnyWork = Array.isArray(myWorks) && myWorks.length > 0
    return (
      <div className="flex gap-2">
        <Button
          onClick={() =>
            navigator.to(`/events/${eventId}/roles/author/new-work`)
          }
        >
          Presentar trabajo
        </Button>
        {hasAnyWork && (
          <Button
            variant="outline"
            onClick={() => navigator.to(`/events/${eventId}/roles/author`)}
          >
            Ver mis trabajos
          </Button>
        )}
      </div>
    )
  }
  if (!activeRegistration) {
    // Si ya está inscripto, no mostramos el modal de inscripción; el card solo informa.
    return trigger(() => {})
  }

  return (
    <RegistrationForm
      eventTitle={eventTitle}
      trigger={trigger}
      speakerDisabled={speakerDisabled}
      setInscriptionSuccess={setInscriptionSuccess}
      prices={prices}
      eventId={eventId}
    />
  )
}

function LimitDate({ limitDate, isOpen }) {
  if (!limitDate) return null; // Prevent formatting null/undefined

  if (isOpen) {
    return <p className="text-gray-500">Fecha límite: {format(limitDate)}</p>
  }

  return <p className="text-gray-500">Cerró: {format(limitDate)}</p>
}
