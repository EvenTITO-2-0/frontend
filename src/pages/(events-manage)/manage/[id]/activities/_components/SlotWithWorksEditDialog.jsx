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
import { format, parseISO } from 'date-fns'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import AssignedWorksTab from '@/pages/(events-manage)/manage/[id]/activities/_components/AssignedWorksTab.jsx'
import { Badge } from '@/components/ui/badge'

// 1. Componente de formulario
const SlotDetails = ({
  formData,
  handleInputChange,
  handleTypeChange,
  isNewEvent,
  handleDelete, // <-- CORRECCIÓN: Recibe 'handleDelete'
  onOpenChange,
  handleSave,
  isFormValid,
}) => (
  <>
    <div className="space-y-4 py-4">
      {/* ... (Todo el formulario que ya tenías) ... */}
      <div className="space-y-2">
        <Label htmlFor="title">Título del Evento</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          placeholder="ej., Reunión de Equipo"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startTime">Hora de Inicio</Label>
        <Input
          id="startTime"
          type="time"
          value={formData.startTime}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endTime">Hora de Fin</Label>
        <Input
          id="endTime"
          type="time"
          value={formData.endTime}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select onValueChange={handleTypeChange} value={formData.type}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slot">Presentacion de trabajos</SelectItem>
            <SelectItem value="break">Receso</SelectItem>
            <SelectItem value="plenary">Plenaria</SelectItem>
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
            onClick={handleDelete} // <-- CORRECCIÓN: Ahora 'handleDelete' está en scope
          >
            Eliminar
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
      </div>
      <Button type="button" onClick={handleSave} disabled={!isFormValid}>
        {isNewEvent ? 'Crear Evento' : 'Guardar Cambios'}
      </Button>
    </DialogFooter>
  </>
)

// 2. Componente principal
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
}) {
  const [formData, setFormData] = useState({
    title: '',
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
            title: '',
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

  // Esta es la función que debe pasarse
  const handleDelete = () => {
    if (onDelete && eventInfo?.id) {
      onDelete(eventInfo.id)
      onOpenChange(false)
    }
  }

  const isFormValid =
    formData.title && formData.date && formData.startTime && formData.endTime

  const hasAssignedWorks = eventInfo?.extendedProps?.works?.length > 0
  const defaultTab = hasAssignedWorks ? 'works' : 'details'

  const dialogWidth = withWorksTab ? 'sm:max-w-[700px]' : 'sm:max-w-[425px]'

  const detailProps = {
    formData,
    handleInputChange,
    handleTypeChange,
    isNewEvent,
    handleDelete, // <-- CORRECCIÓN: Pasar la función 'handleDelete'
    onOpenChange,
    handleSave,
    isFormValid,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogWidth}>
        <DialogHeader>
          <DialogTitle>
            {isNewEvent ? 'Agregar Nuevo Evento' : 'Editar Evento'}
          </DialogTitle>
        </DialogHeader>

        {withWorksTab ? (
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