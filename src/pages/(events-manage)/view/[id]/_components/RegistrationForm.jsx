import FiliationInput from '@/components/Forms/FiliationInput'
import InscriptionRoleSelector from '@/components/Forms/InscriptionRoleSelector'
import LabelForm from '@/components/Forms/LabelForm'
import FullModal from '@/components/Modal/FullModal'
import { Switch } from '@/components/ui/switch'
import { useSubmitInscription } from '@/hooks/events/attendeeHooks'
import { sleep } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@nextui-org/button'
import {
  EVENT_ROLES_LABELS,
  ATTENDEE_ROLE,
  SPEAKER_ROLE,
} from '@/lib/Constants'

export default function RegistrationForm({
  trigger,
  eventTitle,
  speakerDisabled,
  setInscriptionSuccess,
  prices = [],
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(null)
  const [filiation, setFiliation] = useState(null)
  const [filiationFile, setFiliationFile] = useState(null)

  const [showFiliation, setShowFiliation] = useState(false)

  const {
    mutateAsync: submitInscription,
    isPending,
    error: submitError,
  } = useSubmitInscription()

  const isPaidEvent =
    Array.isArray(prices) && prices.some((p) => Number(p.value) > 0)

  // Función para obtener las tarifas organizadas por rol
  function getPricesByRole() {
    const roles = [
      {
        id: ATTENDEE_ROLE,
        title: EVENT_ROLES_LABELS[ATTENDEE_ROLE],
        description: 'Acceso para asistir a las charlas',
        active: true,
      },
      {
        id: SPEAKER_ROLE,
        title: EVENT_ROLES_LABELS[SPEAKER_ROLE],
        description: 'Presentar trabajos en el evento',
        active: !speakerDisabled,
      },
      {
        id: ATTENDEE_ROLE + ',' + SPEAKER_ROLE,
        title:
          EVENT_ROLES_LABELS[SPEAKER_ROLE] +
          ' y ' +
          EVENT_ROLES_LABELS[ATTENDEE_ROLE],
        description: 'Presentar trabajos y asistir al evento',
        active: !speakerDisabled,
      },
    ]

    return roles.map((role) => {
      // Buscar si hay una tarifa para este rol
      const priceForRole = prices.find((price) => {
        if (!price.roles || price.roles.length === 0) return false
        const roleIds = role.id.split(',')
        return roleIds.every((roleId) => price.roles.includes(roleId))
      })

      return {
        ...role,
        price: priceForRole || null,
      }
    })
  }

  function cleanForm() {
    setRole(null)
    setFiliation(null)
    setFiliationFile(null)
  }

  async function handleSubmit(onClose) {
    if (!role) {
      alert('Ingresar al menos un rol para continuar')
    } else if ((!filiation && filiationFile) || (filiation && !filiationFile)) {
      alert(
        'Para definir una filiación: configurar el nombre y subir un archivo'
      )
    } else {
      setIsLoading(true)
      const inscriptionData = {
        file: filiationFile,
        roles: role.split(','),
        affiliation: filiation,
      }

      await submitInscription({ inscriptionData })
      await sleep(2000)

      setIsLoading(false)
      setInscriptionSuccess(true)
      cleanForm()

      onClose()
    }
  }

  return (
    <FullModal
      trigger={trigger}
      title={'Inscripción al evento ' + eventTitle}
      onSubmit={handleSubmit}
      isPending={isLoading}
      submitButtonText={'Finalizar inscripción'}
    >
      <InscriptionRoleSelector
        label={<LabelForm label="Seleccionar el rol en el evento" isRequired />}
        role={role}
        setRole={setRole}
        speakerDisabled={speakerDisabled}
      />
      {showFiliation ? (
        <FiliationInput
          label={
            <LabelFileInput
              showFiliation={showFiliation}
              setShowFiliation={setShowFiliation}
            />
          }
          filiation={filiation}
          setFiliation={setFiliation}
          filiationFile={filiationFile}
          setFiliationFile={setFiliationFile}
        />
      ) : (
        <LabelFileInput
          showFiliation={showFiliation}
          setShowFiliation={setShowFiliation}
        />
      )}

      {isPaidEvent && (
        <div className="space-y-4">
          <LabelForm
            label="Selecciona la tarifa correspondiente a tu rol"
            isRequired
          />
          <div className="flex gap-4 w-full">
            {getPricesByRole().map((roleData) => {
              if (!roleData.active) return null

              return (
                <div
                  key={roleData.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg w-full"
                >
                  <div>
                    <h3 className="font-semibold">{roleData.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {roleData.description}
                    </p>
                    {roleData.price ? (
                      <div className="mt-4">
                        <p className="mt-2 text-sm text-gray-600">
                          {roleData.price.name}: {roleData.price.description}
                        </p>
                        <span className="font-bold text-black mt-4 block">
                          $
                          {roleData.price.amount ||
                            roleData.price.price ||
                            roleData.price.value}{' '}
                          {roleData.price.currency || 'ARS'}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-400 italic">
                        Sin tarifa definida
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center">
            <Button
              className="w-1/4"
              color="primary"
              variant="flat"
              onPress={() => alert('Iniciar flujo de pago (próximo paso)')}
            >
              Realizar pago
            </Button>
          </div>
        </div>
      )}
    </FullModal>
  )
}

function LabelFileInput({ showFiliation, setShowFiliation }) {
  return (
    <div className="flex justify-between">
      <LabelForm label="En caso de tener, ingresar una filiación" />
      <Switch
        checked={showFiliation}
        onCheckedChange={() => setShowFiliation(!showFiliation)}
      />
    </div>
  )
}
