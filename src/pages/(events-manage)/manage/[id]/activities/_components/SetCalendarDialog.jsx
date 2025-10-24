import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { ChevronsRight, Loader2 } from 'lucide-react'

import { useGenerateFromPlantillaMutation } from '@/hooks/events/chairHooks'
import {getEventId} from "@/lib/utils.js";

export default function SetCalendarDialog({ eventRooms, eventId }) {

  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useGenerateFromPlantillaMutation()
  const navigate = useNavigate()

  const handleRedirectToRooms = () => {
    navigate(`/manage/${getEventId()}/rooms`) // Assumes this is your rooms URL
    setOpen(false)
  }

  const handleClick = async () => {
    try {
      const res = await mutateAsync()
      if (res?.status === 201 || res?.ok) {
        setOpen(false) // Close dialog on success
      }
    } catch (e) {
      // TODO Handle error
    }
  }

  const hasNoRooms = !eventRooms || eventRooms.length === 0

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isPending) {
          setOpen(isOpen)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={'success'} style={{ display: 'flex', gap: '8px' }}>
          Generar Calendario
          <ChevronsRight />
        </Button>
      </DialogTrigger>

      <DialogContent
          onInteractOutside={(e) => {
            if (isPending) {
              e.preventDefault()
            }
          }}
      >
        {hasNoRooms ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle />
                  El evento no tiene salas
                </DialogTitle>
              </DialogHeader>
              <p>
                Para generar un calendario de actividades, primero debe
                configurar las salas (rooms) donde ocurrirá el evento.
              </p>
              <div className="w-full flex justify-end gap-2">
                <Button variant={'outline'} onClick={() => setOpen(false)}>
                  Cerrar
                </Button>
                <Button onClick={handleRedirectToRooms}>
                  Ir a crear salas
                </Button>
              </div>
            </>
        ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  ¿Está seguro que desea generar el calendario?
                </DialogTitle>
              </DialogHeader>
              <p>
                Se está por generar el calendario en base a la plantilla definida.
                En la próxima pantalla podrá editar el calendario para cada sala.
              </p>
              <div className="w-full flex justify-end" style={{ gap: '8px' }}>
                <Button
                    variant={'notApproved'}
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                >
                  Seguir editando
                </Button>
                <Button
                    variant={'success'}
                    onClick={handleClick}
                    disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Aceptar
                </Button>
              </div>
            </>
        )}
      </DialogContent>
    </Dialog>
  )
}