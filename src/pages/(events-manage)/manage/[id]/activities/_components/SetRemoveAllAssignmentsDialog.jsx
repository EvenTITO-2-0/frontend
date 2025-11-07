import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  useDeleteAllWorkAssignmentsMutation,
} from '@/hooks/events/slotHooks.js'

export default function SetRemoveAllAssignmentsDialog() {

  const [open, setOpen] = useState(false)
  const { mutateAsync: deleteWorks, isPending } = useDeleteAllWorkAssignmentsMutation()

  const handleClick = async () => {
    try {
      await deleteWorks()
      setOpen(false)
    } catch (e) {
      console.log(e)
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
        <Button  variant={'outline'} style={{ display: 'flex', gap: '8px' }}>
            Remover asignaciones
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
              Remover todas las asingaciones
            </DialogTitle>
          </DialogHeader>
          <p>
            ¿Estás seguro de que deseas eliminar todas las asignaciones de salas y horarios del calendario? Esta acción no se puede deshacer.
          </p>
          <div className="w-full flex justify-end gap-2">
            <Button variant='outline' onClick={() => setOpen(false)}>
              Cerrar
            </Button>
            <Button variant="destructive" onClick={handleClick}>
              Remover asignaciones
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}