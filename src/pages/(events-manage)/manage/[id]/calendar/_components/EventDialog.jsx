import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EVENT_TYPES = [
  { value: 'default', label: 'Default' },
  { value: 'break', label: 'Break' },
  { value: 'plenary', label: 'Plenary' },
]

export default function EventDialog({
  open,
  onOpenChange,
  onConfirm,
  initialData,
}) {
  const [form, setForm] = useState({
    name: '',
    start: '',
    end: '',
    type: 'default',
  })

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    } else {
      setForm({ name: '', start: '', end: '', type: 'default' })
    }
  }, [initialData, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value) => {
    setForm((prev) => ({ ...prev, type: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(form)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Event name"
            />
          </div>
          <div>
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              name="start"
              type="datetime-local"
              value={form.start}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              name="end"
              type="datetime-local"
              value={form.end}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={form.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// In CalendarTable.jsx
import EventDeleteDialog from './EventDeleteDialog'
import { useState } from 'react'

// ...inside ResourceCalendar component
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [eventToDelete, setEventToDelete] = useState(null)

const handleEventClick = (info) => {
  if (!isBetweenAllowedDates(info.event.start, info.event.end)) return
  setEventToDelete(info.event)
  setDeleteDialogOpen(true)
}

const handleDeleteConfirm = () => {
  setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id))
  setDeleteDialogOpen(false)
  setEventToDelete(null)
}

// ...in the return JSX, add:
;<EventDeleteDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  eventTitle={eventToDelete?.title}
  onConfirm={handleDeleteConfirm}
/>
