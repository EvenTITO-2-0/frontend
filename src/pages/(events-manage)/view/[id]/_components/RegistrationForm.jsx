import FiliationInput from '@/components/Forms/FiliationInput'
import InscriptionRoleSelector from '@/components/Forms/InscriptionRoleSelector'
import LabelForm from '@/components/Forms/LabelForm'
import FullModal from '@/components/Modal/FullModal'
import { Switch } from '@/components/ui/switch'
import {
  useNewPayment,
  useSubmitInscription,
} from '@/hooks/events/attendeeHooks'
import { sleep } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@nextui-org/button'
import { useToast } from '@/components/ui/use-toast'

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
  const [selectedRoleForPricing, setSelectedRoleForPricing] = useState(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  const [showFiliation, setShowFiliation] = useState(false)

  const {
    mutateAsync: submitInscription,
    isPending,
    error: submitError,
  } = useSubmitInscription()

  const { mutateAsync: newPayment } = useNewPayment()
  const { toast } = useToast()

  const isPaidEvent =
    Array.isArray(prices) && prices.some((p) => Number(p.value) > 0)

  function getPricesForSelectedRole() {
    if (!selectedRoleForPricing) return []

    return prices.filter((price) => {
      if (!price.roles || price.roles.length === 0) return false
      const selectedRoleIds = selectedRoleForPricing.split(',')
      return selectedRoleIds.every((roleId) => price.roles.includes(roleId))
    })
  }

  function cleanForm() {
    setRole(null)
    setFiliation(null)
    setFiliationFile(null)
  }

  async function handlePaymentRedirect(price) {
    try {
      const inscriptionData = {
        file: filiationFile,
        roles: selectedRoleForPricing ? selectedRoleForPricing.split(',') : [],
        affiliation: filiation,
      }
      await submitInscription({ inscriptionData })

      const paymentData = {
        fare_name: price.name,
        works: [],
      }

      const result = await newPayment({ paymentData })

      const checkoutUrl = result?.data?.checkout_url || result?.data?.init_point
      if (checkoutUrl) {
        setPaymentCompleted(true)
        window.location.href = checkoutUrl
      } else {
        toast({
          title: 'Error',
          description: 'Error connecting with payment service',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error while processing payment',
        variant: 'destructive',
      })
    }
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
      submitButtonDisabled={isPaidEvent && !paymentCompleted}
    >
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
      <InscriptionRoleSelector
        label={<LabelForm label="Seleccionar el rol en el evento" isRequired />}
        role={role}
        setRole={(newRole) => {
          setRole(newRole)
          setSelectedRoleForPricing(newRole)
        }}
        speakerDisabled={speakerDisabled}
      />

      {isPaidEvent && selectedRoleForPricing && (
        <div className="space-y-4">
          <LabelForm label="Selecciona una tarifa" isRequired />
          <div className="space-y-2">
            {getPricesForSelectedRole().map((price, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold">{price.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {price.description}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-center">
                    <Button
                      className="w-32"
                      color="primary"
                      variant="flat"
                      onPress={() => {
                        handlePaymentRedirect(price)
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span>Realizar pago</span>
                        <span className="text-sm font-bold">
                          ${price.amount || price.price || price.value}{' '}
                          {price.currency || 'ARS'}
                        </span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {getPricesForSelectedRole().length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-400 italic text-center">
                  No hay tarifas definidas para este rol
                </p>
              </div>
            )}
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
