import { Label } from '@/components/ui/label.jsx'
import { Input } from '@/components/ui/input.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx'
import { DialogFooter } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'

export const SlotDetails = ({
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
}) => (
  <>
    <div className="space-y-4 py-4">
      {formData.type !== 'slot' && (
        <div className="space-y-2">
          <Label htmlFor="title">Título de la actividad</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="ej., Reunión de Equipo"
          />
        </div>
      )}
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

      {/* CAMBIO: Renderizado condicional para Salas */}
      {formData.type === 'plenary' && (
        <div className="space-y-2">
          <Label htmlFor="room">Sala</Label>
          <Select onValueChange={handleRoomChange} value={formData.room_name}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una sala" />
            </SelectTrigger>
            <SelectContent>
              {eventRooms.length > 0 ? (
                eventRooms.map((room) => (
                  <SelectItem key={room.name} value={room.name}>
                    {room.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="disabled" disabled>
                  No hay salas configuradas
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
    <DialogFooter className="sm:justify-between">
      <div className="flex space-x-2">
        {!isNewEvent && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
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
      <Button type="button" onClick={handleSave} disabled={!isFormValid} >
        {isNewEvent ? 'Crear actividad' : 'Guardar Cambios'}
      </Button>
    </DialogFooter>
  </>
)
