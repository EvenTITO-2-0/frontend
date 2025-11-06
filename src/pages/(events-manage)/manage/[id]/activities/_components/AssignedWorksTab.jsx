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
      alert('Failed to delete work.')
    }
  }

const handleAssignClick = async (work) => {
    try {
      console.log(`Trying to assign work ${work.id} to slot ${slotId}`)
      setLocalWorks((prev) => [...prev, work])
      setLocalUnassignedWorks((prev) => prev.filter((w) => w.id !== work.id))
      await assignWork.mutateAsync({ slot_id: slotId, work_id: work.id })
    } catch (e) {
      alert('Failed to assign work.')
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
          <h3 className="text-lg font-medium">Assigned Works</h3>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </div>

        <ScrollArea className="h-[400px] w-full rounded-md border">
          {localWorks.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
              No works assigned to this slot
            </div>
          ) : (
            <div className="p-4">
              {localWorks.map((work) => (
                <div key={work.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{work.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{work.track}</Badge>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(work.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Work to Slot</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          {!localUnassignedWorks || localUnassignedWorks.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No unassigned works available.
            </div>
          ) : (
            localUnassignedWorks.map((work) => (
              <div
                key={work.id}
                className="flex items-center justify-between mb-4 last:mb-0"
              >
                <div>
                  <h4 className="font-medium">{work.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {work.track}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {work?.authors?.map((a) => a.full_name).join(', ')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAssignClick(work)}
                  disabled={assignWork.isPending}
                >
                  {assignWork.isPending ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}