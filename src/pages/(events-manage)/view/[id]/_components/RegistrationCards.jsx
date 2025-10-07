import CardWithFocus from '@/components/Card/CardWithFocus'
import RegistrationForm from './RegistrationForm'
import { format } from '@formkit/tempo'
import { useEffect, useState } from 'react'
import { useNavigator } from '@/lib/navigation'

export default function RegistrationCards({
  startDate,
  submissionLimit,
  eventTitle,
  eventId,
  activeRegistration,
  inscriptionSuccess,
  setInscriptionSuccess,
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
      />
      <RegistrationCard
        open={{
          title: 'Perído de presentación de trabajos abierto',
          description: 'Haz click para ir al formulario de inscripción',
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
}) {
  const navigator = useNavigator()

  useEffect(() => {
    if (inscriptionSuccess) {
      navigator.to(`/events/${eventId}/view`)
    }
  }, [inscriptionSuccess])

  function trigger(onOpen) {
    return (
      <CardWithFocus
        onClick={() => activeRegistration && isOpen && onOpen()}
        rightComponent={<LimitDate limitDate={limitDate} isOpen={isOpen} />}
      >
        <div className="flex-grow">
          <h2 className="text-lg font-medium text-foreground">
            {isOpen ? open.title : close.title}
          </h2>
          <p className="text-lg text-muted-foreground italic">
            {isOpen && activeRegistration ? open.description : null}
          </p>
        </div>
      </CardWithFocus>
    )
  }
  return (
    <RegistrationForm
      eventTitle={eventTitle}
      trigger={trigger}
      speakerDisabled={speakerDisabled}
      setInscriptionSuccess={setInscriptionSuccess}
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
