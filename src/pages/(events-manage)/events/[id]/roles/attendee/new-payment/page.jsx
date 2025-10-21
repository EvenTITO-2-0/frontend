import { useNavigator } from '@/lib/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { reset } from '@/state/events/newPaymentSlice'
import { useNewPayment } from '@/hooks/events/attendeeHooks'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { getEventId } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Page({ eventData }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const eventId = getEventId()
  const { data: providerStatus, isLoading: isLoadingProvider } =
    useGetProviderStatus(eventId)
  const { mutateAsync: newPayment, isPending } = useNewPayment()
  const [selectedFare, setSelectedFare] = useState(null)
  const [proofFile, setProofFile] = useState(null)

  const hasActiveProvider = providerStatus?.account_status === 'ACTIVE'

  useEffect(() => {
    if (
      !isLoadingProvider &&
      !hasActiveProvider &&
      selectedFare &&
      selectedFare.value !== 0
    ) {
      toast({
        title: 'Error',
        description: 'El proveedor de pagos no está activo',
        variant: 'destructive',
      })
      navigate(`/events/${eventId}/roles/attendee`)
    }
  }, [isLoadingProvider, hasActiveProvider, selectedFare])

  const handleFareSelection = (fare) => {
    setSelectedFare(fare)
  }

  const handlePayment = async () => {
    if (!selectedFare) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una tarifa',
        variant: 'destructive',
      })
      return
    }

    try {
      const baseData = {
        fare_name: selectedFare.name,
        works: [],
      }

      if (selectedFare.value === 0) {
        const result = await newPayment({ paymentData: baseData })
        if (result?.data?.free) {
          toast({
            title: 'Inscripción confirmada',
            description: 'Tarifa gratuita aplicada',
          })
          dispatch(reset())
          navigate(`/events/${eventId}/roles/attendee`)
          return
        }
        toast({
          title: 'Inscripción confirmada',
          description: 'Tarifa gratuita aplicada',
        })
        dispatch(reset())
        navigate(`/events/${eventId}/roles/attendee`)
        return
      }

      if (hasActiveProvider) {
        const result = await newPayment({ paymentData: baseData })
        if (result?.data?.checkout_url) {
          window.location.href = result.data.checkout_url
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo iniciar el pago con Mercado Pago',
            variant: 'destructive',
          })
        }
        return
      }

      // Modo testing manual: requiere comprobante solo si no hay proveedor activo y la tarifa no es gratuita
      if (!proofFile) {
        toast({
          title: 'Falta comprobante',
          description: 'Adjuntá un comprobante para registrar el pago',
          variant: 'destructive',
        })
        return
      }

      const result = await newPayment({
        paymentData: { ...baseData, file: proofFile },
      })
      if (result?.data?.id) {
        toast({
          title: 'Pago registrado',
          description: 'Se subió el comprobante correctamente',
        })
        dispatch(reset())
        navigate(`/events/${eventId}/roles/attendee`)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo registrar el pago',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar el pago',
        variant: 'destructive',
      })
    }
  }

  if (isLoadingProvider) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando estado del proveedor...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedFare?.value === 0
            ? 'Confirmar inscripción gratuita'
            : hasActiveProvider
              ? 'Nuevo pago con Mercado Pago'
              : 'Nuevo pago (modo testing sin tokens)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            {eventData.pricing?.map((fare) => (
              <div
                key={fare.name}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedFare?.name === fare.name
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-primary'
                }`}
                onClick={() => handleFareSelection(fare)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{fare.name}</h3>
                    <p className="text-sm text-gray-600">{fare.description}</p>
                  </div>
                  <div className="text-lg font-bold">
                    {fare.value === 0 ? 'Gratuita' : `$${fare.value}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Solo pedir comprobante si no hay proveedor y la tarifa no es gratuita */}
          {!hasActiveProvider && selectedFare?.value !== 0 && (
            <div className="space-y-2">
              <Label htmlFor="proofFile">Comprobante (archivo)</Label>
              <Input
                id="proofFile"
                type="file"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Se registra el pago adjuntando un comprobante.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                dispatch(reset())
                navigate(`/events/${eventId}/roles/attendee`)
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isPending || !selectedFare}
            >
              {isPending
                ? 'Procesando...'
                : selectedFare?.value === 0
                  ? 'Confirmar inscripción'
                  : hasActiveProvider
                    ? 'Pagar'
                    : 'Registrar pago'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
