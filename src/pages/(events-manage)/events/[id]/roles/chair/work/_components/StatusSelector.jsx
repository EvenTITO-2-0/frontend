import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import ButtonWithLoading from '@/components/ButtonWithLoading'

import { WORKS_STATUS_PUBLISH } from '@/lib/Constants'
import { keyValueToValueLabel } from '@/lib/utils'

const statuses = keyValueToValueLabel(WORKS_STATUS_PUBLISH)

export default function StatusSelector({
  submitChairReview,
  isPending,
  onSubmit,
  hasReviews,
}) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [date, setDate] = useState(null)

  const handleStatusChange = (value) => {
    setSelectedStatus(value)
    if (value !== 'RE_SUBMIT') {
      setDate(null)
    }
  }

  const handleContinue = async () => {
    if (!hasReviews) return // safety guard
    await submitChairReview({ status: selectedStatus, deadlineDate: date })
    setOpen(false)
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Publicar revisión</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publicar revisión</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select onValueChange={handleStatusChange} value={selectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedStatus === 'RE_SUBMIT' && (
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, 'PPP')
                    ) : (
                      <span>Fecha límite de corrección</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          {/* Warning when no reviews */}
          {!hasReviews && (
            <p className="text-sm text-red-600">No hay revisiones para esta entrega. No se puede publicar la revisión.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <ButtonWithLoading
            onClick={handleContinue}
            isLoading={isPending}
            disabled={!hasReviews}
          >
            Continuar
          </ButtonWithLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
