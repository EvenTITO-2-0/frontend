import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, parseISO } from 'date-fns' // DELETED: addMilliseconds is no longer needed here
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs'
import AssignedWorksTab from "@/pages/(events-manage)/manage/[id]/activities/_components/AssignedWorksTab.jsx";
import { Badge } from "@/components/ui/badge"
export default function EventDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  eventInfo,
  isNewEvent,
  lastSelectedType,
  unassignedWorks
}) {
  const [formData, setFormData] = useState({
    title: 'Intervalo',
    date: '',
    startTime: '',
    endTime: '',
    type: 'slot',
  })

  useEffect(() => {
    if (open && eventInfo) {
      if (isNewEvent) {
        const { startStr, endStr } = eventInfo
        if (startStr && endStr) {
          setFormData({
            title: 'Intervalo',
            date: format(parseISO(startStr), 'yyyy-MM-dd'),
            startTime: format(parseISO(startStr), 'HH:mm'),
            endTime: format(parseISO(endStr), 'HH:mm'),
            type: lastSelectedType,
          })
        }
      } else {
        const { title, start, end } = eventInfo
        if (start && end) {
          setFormData({
            title,
            date: format(start, 'yyyy-MM-dd'),
            startTime: format(start, 'HH:mm'),
            endTime: format(end, 'HH:mm'),
            type: eventInfo.extendedProps.type || 'slot',
          })
        }
      }
    }
  }, [open, eventInfo, isNewEvent, lastSelectedType])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }))
  }

  const handleSave = () => {
    const start = parseISO(`${formData.date}T${formData.startTime}`)
    const end = parseISO(`${formData.date}T${formData.endTime}`)
    onSave({
      id: eventInfo?.id || null,
      title: formData.title,
      start,
      end,
      type: formData.type,
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (onDelete && eventInfo?.id) {
      onDelete(eventInfo.id)
      onOpenChange(false)
    }
  }

  const isFormValid =
    formData.title && formData.date && formData.startTime && formData.endTime

  const hasAssignedWorks = eventInfo?.extendedProps?.works?.length > 0
  const defaultTab = hasAssignedWorks ? "works" : "details"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isNewEvent ? 'Add New Event' : 'Edit Event'}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="works" disabled={isNewEvent}>
              Works
              {hasAssignedWorks && (
                <Badge variant="secondary" className="ml-2">
                  {eventInfo.extendedProps.works.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Team Meeting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={handleTypeChange} value={formData.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slot">Slot</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="plenary">Plenary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="flex space-x-2">
                {!isNewEvent && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
              </div>
              <Button type="button" onClick={handleSave} disabled={!isFormValid}>
                {isNewEvent ? 'Create Event' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="works">
            <AssignedWorksTab works={eventInfo?.extendedProps?.works} slotId={eventInfo?.id} unassignedWorks={unassignedWorks}/>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}