import FiliationInput from '@/components/Forms/FiliationInput'
import InscriptionRoleSelector from '@/components/Forms/InscriptionRoleSelector'
import LabelForm from '@/components/Forms/LabelForm'
import FullModal from '@/components/Modal/FullModal'
import { Switch } from '@/components/ui/switch'
import { useSubmitInscription } from '@/hooks/events/attendeeHooks'
import { sleep } from '@/lib/utils'
import { useState } from 'react'

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
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Pago requerido
          </h3>
          <p className="text-blue-700 mb-4">
            Selecciona la tarifa correspondiente a tu rol.
          </p>
          <div className="space-y-2">
            {prices.map((price, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-white border rounded"
              >
                <div>
                  <span className="font-medium">{price.name}</span>
                  <p className="text-sm text-gray-600">{price.description}</p>
                </div>
                <span className="font-bold text-green-600">
                  ${price.amount || price.price || price.value}{' '}
                  {price.currency || 'ARS'}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            onClick={() => alert('Iniciar flujo de pago (próximo paso)')}
          >
            Realizar pago
          </button>
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
