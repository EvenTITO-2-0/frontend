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

  const formatSchedule = (startStr, endStr) => {
    if (!startStr) return 'No asignada'

    try {
      const startDate = new Date(startStr)

      if (isNaN(startDate.getTime())) {
        return 'Fecha inválida'
      }

      const dateFormatted = startDate.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })

      const startTime = startDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      return `${dateFormatted} ${startTime}`
    } catch (e) {
      return 'Error fecha'
    }
  }

  const displayRoom = work.room_name || work.talk?.location || 'No asignada'
  const displayStart = work.start_date || work.talk?.date
  const displayEnd = work.end_date || work.talk?.end_date

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold group-hover:text-primary transition-colors">
              {work.title}
            </h4>
            <Badge
              variant={
                work.state === WORK_SUBMITTED_STATUS ? 'secondary' : 'success'
              }
              className="ml-2 shrink-0"
            >
              {WORKS_STATUS_LABELS[work.state] || work.state}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Track: {work.track}
          </p>

          <div className="mt-auto grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate" title={displayRoom}>
                {displayRoom}
              </span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate" title={formatSchedule(displayStart, displayEnd)}>
                {formatSchedule(displayStart, displayEnd)}
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