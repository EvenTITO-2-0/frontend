// --- 1. Import useEffect ---
import { useState, useEffect } from 'react'
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// --- 2. Define localStorage keys ---
const TIME_KEY = 'assignDialog_timePerWork'
const RESET_KEY = 'assignDialog_resetAssignments'

export default function AssignDialog() {
    const [open, setOpen] = useState(false)
    const { mutateAsync: assignWorks, isPending } = useAssignWorksMutation()

    const [timePerWork, setTimePerWork] = useState(() => {
        const savedTime = localStorage.getItem(TIME_KEY)
        return savedTime !== null ? parseInt(savedTime, 10) : 15
    })

    const [resetAssignments, setResetAssignments] = useState(() => {
        const savedReset = localStorage.getItem(RESET_KEY)
        return savedReset !== null ? JSON.parse(savedReset) : false
    })

    useEffect(() => {
        localStorage.setItem(TIME_KEY, String(timePerWork))
    }, [timePerWork])

    useEffect(() => {
        localStorage.setItem(RESET_KEY, JSON.stringify(resetAssignments))
    }, [resetAssignments])

    const handleClick = async () => {
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