import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import WorkItem from './WorkItem'
import { Layers } from 'lucide-react'

export default function TrackDialog({
    isOpen,
    onClose,
    onSave,
    track,
    selectedWork,
    rooms,
}) {
    if (!track) return null

    const works = selectedWork ? [selectedWork] : track.works

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {selectedWork
                            ? 'Detalles de la presentación'
                            : 'Detalles del Track'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                            <Layers className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{track.name}</h2>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">
                            Entregas
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {works.map((work) => (
                                <WorkItem
                                    key={work.id}
                                    work={work}
                                    rooms={rooms}
                                    onSave={onSave}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
