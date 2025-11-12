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

export default function PublishCalendarDialog({ onPublish }) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleClick = async () => {
    setIsPending(true)
    try {
      await onPublish()
      setOpen(false)
    } catch (e) {
      console.error('Failed to publish calendar:', e)
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
          Publicar
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
            Publicar calendario del evento
          </DialogTitle>
        </DialogHeader>
        <p>
          ¿Estás seguro de que deseas publicar el calendario del evento? Este será
          público y visible para todos los asistentes al congreso.
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
            variant="default"
            onClick={handleClick}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}