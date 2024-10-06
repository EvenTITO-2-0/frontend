import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import WorkItem from './WorkItem'

export default function SpeakerDialog({
  isOpen,
  onClose,
  speaker,
  selectedWork,
  rooms,
}) {
  const handleSaveWork = (editedWork) => {
    // Here you would typically update your local state or refetch the data
    toast({
      title: 'Cambios guardados',
      description: 'Los cambios se han guardado correctamente.',
    })
  }

  if (!speaker) return null

  const works = selectedWork ? [selectedWork] : speaker.works

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedWork
              ? 'Detalles de la Charla'
              : 'Detalles del presentador'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${speaker.full_name}`}
              />
              <AvatarFallback>
                {speaker.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{speaker.full_name}</h2>
              <p className="text-muted-foreground">{speaker.mail}</p>
              {speaker.membership && (
                <p className="text-muted-foreground">{speaker.membership}</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {selectedWork ? 'Charla' : 'Charlas'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {works.map((work) => (
                <WorkItem
                  key={work.id}
                  work={work}
                  rooms={rooms}
                  onSave={handleSaveWork}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
