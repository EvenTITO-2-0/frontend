import { useState, useEffect } from 'react'
import { X, MapPin, Users, AtSign, Calendar, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import ButtonWithLoading from '@/components/ButtonWithLoading'

export default function Details({ event, onClose, onSetEventStatus }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleSetEventStatus = async (newStatus) => {
    setIsPending(true)
    await onSetEventStatus(event.id, newStatus)
    handleClose()
    setIsPending(false)
  }

  return (
    <div
      className={`mt-14 border-t-2 border-l-2 border-slate-50 fixed inset-y-0 right-0 w-full sm:w-2/3 lg:w-1/2 bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{event.title}</h2>
          <Button variant="table" size="icon" onClick={handleClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{event.event_type}</Badge>
            <span className="text-sm text-gray-500">
              ID: {event.id.slice(0, 8)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.creator.fullname}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <AtSign className="h-4 w-4 mr-2" />
              <span>{event.creator.email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location || 'Ubicación por definir'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{event.dates?.length || 0} fechas definidas</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-5 w-5" />
            Descripción del evento
          </h3>
          <p className="text-gray-600 whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        <div className="fixed bottom-0 left-1/2 right-0 bg-white p-4">
          <div className="flex justify-end space-x-4 max-w-md mx-auto">
            <Button
              variant="notApproved"
              className="w-full"
              onClick={() => handleSetEventStatus('NOT_APPROVED')}
            >
              Rechazar
            </Button>
            <ButtonWithLoading
              className="w-full"
              onClick={() => handleSetEventStatus('CREATED')}
              isLoading={isPending}
              variant={'default'}
            >
              Aceptar
            </ButtonWithLoading>
          </div>
        </div>
      </div>
    </div>
  )
}
