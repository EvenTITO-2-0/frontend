import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAssignWorksMutation } from '@/hooks/events/slotHooks.js'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

const TIME_KEY = 'assignDialog_timePerWork'
const RESET_KEY = 'assignDialog_resetAssignments'

// new localStorage keys for slider preferences
const SAME_DAY_KEY = 'assignDialog_sameDayWeight'
const SAME_ROOM_KEY = 'assignDialog_sameRoomWeight'
const UNASSIGNED_KEY = 'assignDialog_unassignedWeight'

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

  // --- new sliders states ---
  const [sameDayWeight, setSameDayWeight] = useState(() => {
    const saved = localStorage.getItem(SAME_DAY_KEY)
    return saved !== null ? Number(saved) : 3
  })
  const [sameRoomWeight, setSameRoomWeight] = useState(() => {
    const saved = localStorage.getItem(SAME_ROOM_KEY)
    return saved !== null ? Number(saved) : 3
  })
  const [unassignedWeight, setUnassignedWeight] = useState(() => {
    const saved = localStorage.getItem(UNASSIGNED_KEY)
    return saved !== null ? Number(saved) : 3
  })

  // persist changes locally
  useEffect(() => {
    localStorage.setItem(TIME_KEY, String(timePerWork))
  }, [timePerWork])

  useEffect(() => {
    localStorage.setItem(RESET_KEY, JSON.stringify(resetAssignments))
  }, [resetAssignments])

  useEffect(() => {
    localStorage.setItem(SAME_DAY_KEY, String(sameDayWeight))
  }, [sameDayWeight])

  useEffect(() => {
    localStorage.setItem(SAME_ROOM_KEY, String(sameRoomWeight))
  }, [sameRoomWeight])

  useEffect(() => {
    localStorage.setItem(UNASSIGNED_KEY, String(unassignedWeight))
  }, [unassignedWeight])

  const handleClick = async () => {
    const parameters = {
      time_per_work: timePerWork,
      reset_previous_assignments: resetAssignments,
      weights: {
        same_day_tracks: sameDayWeight,
        same_room_tracks: sameRoomWeight,
        unassigned_works: unassignedWeight,
      },
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
        if (!isPending) setOpen(isOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" style={{ display: 'flex', gap: '8px' }}>
          Asignar trabajos
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <>
          <DialogHeader>
            <DialogTitle>Asignación automática de trabajos</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p>Configure los parámetros para la asignación automática de trabajos.</p>

            <div className="space-y-2">
              <Label htmlFor="time-per-work">Tiempo por trabajo (en minutos)</Label>
              <Input
                id="time-per-work"
                type="number"
                value={timePerWork}
                onChange={(e) => setTimePerWork(parseInt(e.target.value) || 0)}
                disabled={isPending}
              />
            </div>
              {/* --- Sliders Section --- */}
            <div className="space-y-5 mt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Ajuste las prioridades para guiar cómo se asignarán los trabajos.
                  Un valor más alto indica mayor importancia en esa preferencia.
                  Una mayor preferencia puede generar que algunos trabajos queden sin asignar, y deban ser completados manualmente.
                </p>

                {/* --- Same day --- */}
                <div className="space-y-1">
                  <Label>Priorizar mantener tracks en el mismo día</Label>
                  <Slider
                    value={[sameDayWeight]}
                    onValueChange={([v]) => setSameDayWeight(v)}
                    min={1}
                    max={5}
                    step={1}
                    disabled={isPending}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Baja prioridad</span>
                    <span>Alta prioridad</span>
                  </div>
                </div>

                {/* --- Same room --- */}
                <div className="space-y-1 mt-4">
                  <Label>Priorizar mantener el mismo salón entre días</Label>
                  <Slider
                    value={[sameRoomWeight]}
                    onValueChange={([v]) => setSameRoomWeight(v)}
                    min={1}
                    max={5}
                    step={1}
                    disabled={isPending}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Baja prioridad</span>
                    <span>Alta prioridad</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reset-assignments"
                checked={resetAssignments}
                onCheckedChange={setResetAssignments}
                disabled={isPending}
              />
              <Label htmlFor="reset-assignments" className="text-sm font-medium leading-none">
                Limpiar asignaciones anteriores
              </Label>
            </div>
          </div>

          <div className="w-full flex justify-end" style={{ gap: '8px' }}>
            <Button variant="notApproved" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="default" onClick={handleClick} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Asignar
            </Button>
          </div>
        </>
      </DialogContent>
    </Dialog>
  )
}