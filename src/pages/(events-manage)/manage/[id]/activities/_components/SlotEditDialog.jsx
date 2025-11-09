import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AssignedWorksTab from '@/pages/(events-manage)/manage/[id]/activities/_components/AssignedWorksTab.jsx'
import { Badge } from '@/components/ui/badge'
import { SlotDetails } from '@/pages/(events-manage)/manage/[id]/activities/_components/SlotDetails.jsx'

// 2. Componente principal (Modificado)
export default function SlotEditDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  eventInfo,
  isNewEvent,
  lastSelectedType,
  unassignedWorks,
  withWorksTab = false,
  eventRooms = [], // Prop nueva
}) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'slot',
    room_id: '', // Campo nuevo
  })

  useEffect(() => {
    if (open && eventInfo) {
      if (isNewEvent) {
        const { startStr, endStr } = eventInfo
        if (startStr && endStr) {
          setFormData({
            title: '',
            date: format(parseISO(startStr), 'yyyy-MM-dd'),
            startTime: format(parseISO(startStr), 'HH:mm'),
            endTime: format(parseISO(endStr), 'HH:mm'),
            type: lastSelectedType,
            room_id: '', // Campo nuevo
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
            room_id: eventInfo.extendedProps.room_id || '', // Campo nuevo
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

  // Handler nuevo para la sala
  const handleRoomChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      room_id: value,
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
      // CAMBIO: Añadir room_id solo si es relevante
      room_id: formData.type === 'plenary' ? formData.room_id : null,
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (onDelete && eventInfo?.id) {
      onDelete(eventInfo.id)
      onOpenChange(false)
    }
  }

  // CAMBIO: Lógica de validación actualizada
  const isTitleRequired =
    formData.type === 'plenary' || formData.type === 'break'
  const isFormValid =
    (isTitleRequired ? formData.title : true) && // El título es válido si no se requiere, o si se requiere Y está presente
    formData.date &&
    formData.startTime &&
    formData.endTime

  const hasAssignedWorks = eventInfo?.extendedProps?.works?.length > 0
  const defaultTab = hasAssignedWorks ? 'works' : 'details'

  const dialogWidth = withWorksTab ? 'sm:max-w-[700px]' : 'sm:max-w-[425px]'

  const detailProps = {
    formData,
    handleInputChange,
    handleTypeChange,
    handleRoomChange, // Prop nueva
    eventRooms, // Prop nueva
    isNewEvent,
    handleDelete,
    onOpenChange,
    handleSave,
    isFormValid,
  }
  const showWorksTabs = withWorksTab && formData.type === 'slot'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogWidth}>
        <DialogHeader>
          <DialogTitle>
            {isNewEvent ? 'Agregar Nuevo Evento' : 'Editar Evento'}
          </DialogTitle>
        </DialogHeader>

        {showWorksTabs ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="works" disabled={isNewEvent}>
                Trabajos
                {hasAssignedWorks && (
                  <Badge variant="secondary" className="ml-2">
                    {eventInfo.extendedProps.works.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <SlotDetails {...detailProps} />
            </TabsContent>
            <TabsContent value="works">
              <AssignedWorksTab
                works={eventInfo?.extendedProps?.works}
                slotId={eventInfo?.id}
                unassignedWorks={unassignedWorks}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <SlotDetails {...detailProps} />
        )}
      </DialogContent>
    </Dialog>
  )
}