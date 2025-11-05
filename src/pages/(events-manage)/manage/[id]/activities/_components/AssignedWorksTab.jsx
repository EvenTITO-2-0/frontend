import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {useDeleteWorkSlotMutation} from "@/hooks/events/slotHooks.js";
import {useEffect, useState} from "react";

export default function AssignedWorksTab({ works }) {
  const deleteWorkSlot = useDeleteWorkSlotMutation()
  const [localWorks, setLocalWorks] = useState(works || [])
  useEffect(() => {
    setLocalWorks(works || [])
  }, [works])

  if (!localWorks?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No works assigned to this slot
      </div>
    )
  }

  const handleDelete = async (workId) => {
    try {
      await deleteWorkSlot.mutateAsync({workId: workId})
      setLocalWorks((prev) => prev.filter((w) => w.id !== workId))
    } catch (e) {
      alert("Failed to delete work.")
    }
  }

  return (
    <ScrollArea className="h-[440px] w-full rounded-md border p-4">
      {localWorks.map((work) => (
        <div key={work.id} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{work.title}</h4>
              <p className="text-sm text-muted-foreground">
                {work?.authors?.join(", ")}
              </p>
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
    </ScrollArea>
  )
}
