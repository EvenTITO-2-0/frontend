import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import ButtonWithLoading from '@/components/ButtonWithLoading'

export default function ConfirmDeletePriceDialog({
  priceName,
  onConfirm,
  isLoading,
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          Borrar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación de tarifa</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar la tarifa "{priceName}"? Esta
            acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" className="mr-2">
            Cancelar
          </Button>
          <ButtonWithLoading
            variant="destructive"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Continuar
          </ButtonWithLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
