import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {ChevronsLeft} from 'lucide-react'
import { useDeleteRoomsMutation } from '@/hooks/events/slotHooks.js'

export default function SetDeleteDialog() {

  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useDeleteRoomsMutation()

  const handleClick = async () => {
    try {
      const res = await mutateAsync()
      if (res?.status === 200 || res?.ok) {
        setOpen(false)
      }
    } catch (e) {
      // TODO Handle erroruseDeleteRoomsMutation
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
        <Button variant={'destructive'} style={{ display: 'flex', gap: '8px' }}>
            <ChevronsLeft />
            Volver
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
              Eliminar calendario actual
            </DialogTitle>
          </DialogHeader>
          <p>
            ¿Desea volver a la pantalla de creación de calendario? Se perderán todos los cambios.
          </p>
          <div className="w-full flex justify-end gap-2">
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cerrar
            </Button>
            <Button variant="destructive" onClick={handleClick}>
              Eliminar calendario
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}