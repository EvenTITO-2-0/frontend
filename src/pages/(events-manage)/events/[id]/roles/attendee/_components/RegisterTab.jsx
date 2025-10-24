import React, { useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUpdateInscription } from '@/hooks/events/attendeeHooks'
import ButtonWithLoading from '@/components/ButtonWithLoading'
import { INSCRIPTION_ROLES_LABELS } from '@/lib/Constants.js'

export default function RegisterTab({ inscription }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editInscription, setEditInscription] = useState({
    affiliation: inscription.affiliation,
    roles: undefined,
  })

  const {
    mutateAsync: changeRegistration,
    isPending,
    error,
  } = useUpdateInscription()

  const hasApprovedPayment = (inscription.payments || []).some(
    (p) => p.status === 'APPROVED'
  )

  const handleEdit = () => {
    if (hasApprovedPayment) return
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    const newInscriptionData = {
      roles: editInscription.roles
        ? editInscription.roles.split(',')
        : inscription.roles,
    }
    if (editInscription.affiliation) {
      newInscriptionData.affiliation = editInscription.affiliation
      newInscriptionData.file = editInscription.file
    }
    await changeRegistration({
      inscriptionId: inscription.id,
      newInscriptionData,
    })
    setIsEditing(false)
    setEditInscription({
      affiliation: inscription.affiliation,
      roles: undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Datos de inscripción</span>
          <EditInscriptionButton
            isEditing={isEditing}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            isLoading={isPending}
            disabled={hasApprovedPayment}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <EditInscription
            editInscription={editInscription}
            setEditInscription={setEditInscription}
            error={error}
          />
        ) : (
          <ViewInscription inscription={inscription} />
        )}
      </CardContent>
    </Card>
  )
}

function EditInscriptionButton({
  isEditing,
  handleEdit,
  handleCancel,
  handleSave,
  isLoading,
  disabled = false,
}) {
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <ButtonWithLoading
          onClick={handleSave}
          isLoading={isLoading}
          text="Guardar"
        />
      </div>
    )
  }

  return (
    <Button onClick={handleEdit} variant="outline" disabled={disabled}>
      {disabled ? 'Inscripción finalizada' : 'Editar'}
    </Button>
  )
}

function ViewInscription({ inscription }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <span className="font-semibold">
          Participación elegida:{' '}
          {inscription.roles
            .map((role) => INSCRIPTION_ROLES_LABELS[role])
            .join(', ')}
        </span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="font-semibold">
          Filiación (opcional): {inscription.affiliation || 'Sin filiación'}
        </span>
      </div>
    </div>
  )
}

function EditInscription({ editInscription, setEditInscription, error }) {
  const handleInputChange = (field, value) => {
    setEditInscription((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setEditInscription((prev) => ({ ...prev, file }))
    }
  }
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roles">Participación elegida</Label>
          <Select
            value={editInscription.roles}
            onValueChange={(value) => handleInputChange('roles', value)}
          >
            <SelectTrigger id="roles">
              <SelectValue placeholder="Seleccionar roles" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INSCRIPTION_ROLES_LABELS).map(([key, value]) => (
                <SelectItem value={key}>{value}</SelectItem>
              ))}
              <SelectItem
                value={Object.keys(INSCRIPTION_ROLES_LABELS).join(',')}
              >
                Asistente y autor
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliation">Filiacion (Opcional)</Label>
          <Input
            id="affiliation"
            value={editInscription.affiliation}
            onChange={(e) => handleInputChange('affiliation', e.target.value)}
            placeholder="Ingresa tu filiacion"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">
            Comprobante de filiacion (Opcional)
          </Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Elegir archivo
            </Button>
            <span className="text-sm text-gray-500">
              {editInscription.file
                ? editInscription.file.name
                : 'Ningun archivo seleccionado'}
            </span>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </>
  )
}
