import {useState} from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {ChevronsRight, Loader2} from 'lucide-react'
import { useAssignWorksMutation } from '@/hooks/events/slotHooks.js'

export default function AssignDialog() {

    const [open, setOpen] = useState(false)
    const {mutateAsync, isPending} = useAssignWorksMutation()

    const handleClick = async () => {
        try {
            const res = await mutateAsync()
            if (res?.status === 201 || res?.ok) {
                setOpen(false) // Close dialog on success
            }
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
                <Button variant={'success'} style={{display: 'flex', gap: '8px'}}>
                    Asignar trabajos
                    <ChevronsRight/>
                </Button>
            </DialogTrigger>

            <DialogContent
                onInteractOutside={(e) => {
                    if (isPending) {
                        e.preventDefault()
                    }
                }}
            >
                <>
                    <DialogHeader>
                        <DialogTitle>
                            Asignación automática de trabajos
                        </DialogTitle>
                    </DialogHeader>
                    <p>
                        Se van a asignar los trabajos ya cargados a los slots disponibles.
                        Podrá seguir editando el calendario ¿Desea continuar?
                    </p>
                    <div className="w-full flex justify-end" style={{gap: '8px'}}>
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
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Asignar
                        </Button>
                    </div>
                </>
            </DialogContent>
        </Dialog>
    )
}