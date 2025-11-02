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
import { useAssignWorksMutation } from '@/hooks/events/slotHooks.js'

// --- Import new components for the form ---
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export default function AssignDialog() {
    const [open, setOpen] = useState(false)
    const { mutateAsync: assignWorks, isPending } = useAssignWorksMutation()

    // --- Add state for your form parameters ---
    const [timePerWork, setTimePerWork] = useState(15) // Default: 15 minutes
    const [resetAssignments, setResetAssignments] = useState(true)

    const handleClick = async () => {
        // --- Package parameters into an object ---
        const parameters = {
            time_per_work: timePerWork,
            reset_previous_assignments: resetAssignments,
        }

        try {
            const res = await assignWorks({ parameters })
            if (res?.status === 200 || res?.ok) {
                setOpen(false)
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
                <Button variant={'success'} style={{ display: 'flex', gap: '8px' }}>
                    Asignar trabajos
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
                <>
                    <DialogHeader>
                        <DialogTitle>
                            Asignación automática de trabajos
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <p>
                            Configure los parámetros para la asignación automática de trabajos.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="time-per-work">
                                Tiempo por trabajo (en minutos)
                            </Label>
                            <Input
                                id="time-per-work"
                                type="number"
                                value={timePerWork}
                                onChange={(e) => setTimePerWork(parseInt(e.target.value) || 0)}
                                disabled={isPending}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="reset-assignments"
                                checked={resetAssignments}
                                onCheckedChange={setResetAssignments}
                                disabled={isPending}
                            />
                            <Label
                                htmlFor="reset-assignments"
                                className="text-sm font-medium leading-none"
                            >
                                Limpiar asignaciones anteriores
                            </Label>
                        </div>
                    </div>

                    <div className="w-full flex justify-end" style={{ gap: '8px' }}>
                        <Button
                            variant={'notApproved'}
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant={'success'}
                            onClick={handleClick}
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Asignar
                        </Button>
                    </div>
                </>
            </DialogContent>
        </Dialog>
    )
}