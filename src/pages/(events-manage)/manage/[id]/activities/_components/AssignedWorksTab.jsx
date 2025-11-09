import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import {
  useAssignWorkToSlotMutation,
  useDeleteWorkSlotMutation,
} from '@/hooks/events/slotHooks.js'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
// 1. Importar el Separator
import { Separator } from '@/components/ui/separator'

export default function AssignedWorksTab({ works, slotId, unassignedWorks }) {
  const deleteWorkSlot = useDeleteWorkSlotMutation()
  const assignWork = useAssignWorkToSlotMutation()
  const [localWorks, setLocalWorks] = useState(works || [])
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [localUnassignedWorks, setLocalUnassignedWorks] = useState(
    unassignedWorks || []
  )

  useEffect(() => {
    setLocalWorks(works || [])
  }, [works])

  useEffect(() => {
    setLocalUnassignedWorks(unassignedWorks || [])
  }, [unassignedWorks])

  const handleDelete = async (workId) => {
    try {
      await deleteWorkSlot.mutateAsync({ workId: workId })
      setLocalWorks((prev) => prev.filter((w) => w.id !== workId))
    } catch (e) {
      alert('Error al eliminar el trabajo.')
    }
  }

  const handleAssignClick = async (work) => {
    try {
      console.log(`Trying to assign work ${work.id} to slot ${slotId}`)
      setLocalWorks((prev) => [...prev, work])
      setLocalUnassignedWorks((prev) => prev.filter((w) => w.id !== work.id))
      await assignWork.mutateAsync({ slot_id: slotId, work_id: work.id })
    } catch (e) {
      alert('Error al asignar el trabajo.')
      console.error('Failed to assign work.', e)
      // Revert state on failure
      setLocalWorks(works || [])
      setLocalUnassignedWorks(unassignedWorks || [])
    }
  }

  return (
    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Trabajos Asignados</h3>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </div>

        <ScrollArea className="h-[400px] w-full rounded-md border">
          {localWorks.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
              No hay trabajos asignados a este horario
            </div>
          ) : (
            <div className="p-4">
              {/* 2. Usar el index en el map */}
              {localWorks.map((work, index) => (
                // Envolver cada item para que la key esté en el div principal
                <div key={work.id}>
                  {/* 4. Agregar padding vertical (py-2) */}
                  <div className="flex items-center justify-between py-2">
                    {/* Estructura corregida para que el justify-between funcione */}
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-small text-sm line-clamp-2 leading-relaxed">
                        <Badge
                          variant="default"
                          className="mr-1.5 align-baseline text-xs px-1.5 py-0.5"
                        >
                          {work.track}
                        </Badge>
                        {work.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="icon"
                        // CAMBIO AQUÍ: Se agregó className para achicar el botón
                        className="h-8 w-8"
                        onClick={() => handleDelete(work.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* 3. Agregar Separator si no es el último item */}
                  {index < localWorks.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asignar Trabajo a Horario</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {!localUnassignedWorks || localUnassignedWorks.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No hay trabajos sin asignar disponibles.
            </div>
          ) : (
            // 2. Usar el index en el map
            localUnassignedWorks.map((work, index) => (
              <div key={work.id}>
                {/* 4. Agregar padding vertical (py-3) y quitar mb-4 */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-medium line-clamp-2">{work.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {work.track}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {work?.authors?.map((a) => a.full_name).join(', ')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssignClick(work)}
                    disabled={assignWork.isPending}
                  >
                    {assignWork.isPending ? 'Asignando...' : 'Asignar'}
                  </Button>
                </div>
                {/* 3. Agregar Separator si no es el último item */}
                {index < localUnassignedWorks.length - 1 && <Separator />}
              </div>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}