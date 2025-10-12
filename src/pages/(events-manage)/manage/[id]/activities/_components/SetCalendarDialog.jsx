import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronsRight } from 'lucide-react'
import { useGenerateFromPlantillaMutation } from '@/hooks/events/chairHooks'

export default function SetCalendarDialog({ onCalendarSet }) {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isLoading } = useGenerateFromPlantillaMutation()

  const handleClick = async () => {
    try {
      const res = await mutateAsync()
      if (res?.status === 201 || res?.ok) {
        if (onCalendarSet) onCalendarSet()
        setOpen(false)
      }
    } catch (e) {
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'success'} style={{ display: 'flex', gap: '8px' }}>
          Generar Calendario<ChevronsRight/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Está seguro que desea generar el calendario?</DialogTitle>
        </DialogHeader>
        <p>Se está por generar el calendario en base a la plantilla definida. En la próxima pantalla podrá editar el calendario para cada sala.</p>
        {isLoading ? (
          <div className="w-full flex justify-center py-4">Cargando...</div>
        ) : (
          <div className="w-full flex justify-end" style={{ gap: '8px' }}>
            <Button variant={'notApproved'} onClick={() => setOpen(false)}>
              Seguir editando
            </Button>
            <Button variant={'success'} onClick={handleClick}>
              Aceptar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
