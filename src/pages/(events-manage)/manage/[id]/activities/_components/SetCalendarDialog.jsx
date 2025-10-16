import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { ChevronsRight, Loader2 } from 'lucide-react'

import { useGenerateFromPlantillaMutation } from '@/hooks/events/chairHooks'

export default function SetCalendarDialog({ onCalendarSet }) {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useGenerateFromPlantillaMutation()

  const handleClick = async () => {
    try {
      const res = await mutateAsync()
      if (res?.status === 201 || res?.ok) {
        if (onCalendarSet) onCalendarSet()
        setOpen(false) // Close dialog on success
      }
    } catch (e) {
      // TODO Handle error
    }
  }

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
        <DialogHeader>
          <DialogTitle>
            ¿Está seguro que desea generar el calendario?
          </DialogTitle>
        </DialogHeader>
        <p>
          Se está por generar el calendario en base a la plantilla definida. En
          la próxima pantalla podrá editar el calendario para cada sala.
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
        {/* --- END CHANGE --- */}
      </DialogContent>
    </Dialog>
  )
}