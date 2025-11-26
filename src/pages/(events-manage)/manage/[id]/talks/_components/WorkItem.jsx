import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, MapPinIcon } from 'lucide-react'
import WorkEditDialog from './WorkEditDialog'
import { WORK_SUBMITTED_STATUS, WORKS_STATUS_LABELS } from '@/lib/Constants'

export default function WorkItem({ work, rooms, onSave }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleSave = async (workId, track, talk) => {
    await onSave(workId, track, talk)
    setIsEditDialogOpen(false)
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold group-hover:text-primary transition-colors">
              {work.title}
            </h4>
            <Badge
              variant={
                work.state === WORK_SUBMITTED_STATUS ? 'secondary' : 'success'
              }
            >
              {WORKS_STATUS_LABELS[work.state]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Track: {work.track}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPinIcon className="w-4 h-4 mr-2" />
              <span>{work.talk?.location || 'No asignada'}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>
                {work.talk?.date
                  ? new Date(work.talk.date).toLocaleString()
                  : 'No asignada'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <WorkEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        work={work}
        rooms={rooms}
        onSave={handleSave}
      />
    </>
  )
}
