import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function UnpublishCalendarDialog({ onClick }) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleClick = async () => {
    setIsPending(true)
    try {
      await onClick()
      setOpen(false)
    } catch (e) {
      console.error('Failed to unpublish calendar:', e)
    } finally {
      setIsPending(false)
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
        <Button variant={'outline'} style={{ display: 'flex', gap: '8px' }}>
          Cancelar publicación
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
          <DialogTitle className="flex items-center gap-2 text-destructive">
            Cancelar publicación del calendario
          </DialogTitle>
        </DialogHeader>
        <p>
          ¿Estás seguro de que deseas cancelar la publicación del calendario del evento? Podrás volver a editarlo pero dejará de ser
          visible para los asistentes al congreso hasta que vuelvas a publicarlo.
        </p>
        <div className="w-full flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cerrar
          </Button>
          <Button
            variant="success"
            onClick={handleClick}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Despublicar calendario
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}