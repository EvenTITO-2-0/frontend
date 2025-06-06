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

export default function Page({ eventData }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const eventId = getEventId()
  const { data: providerStatus, isLoading: isLoadingProvider } =
    useGetProviderStatus(eventId)
  const { mutateAsync: newPayment, isPending } = useNewPayment()
  const [selectedFare, setSelectedFare] = useState(null)

  const hasActiveProvider = providerStatus?.account_status === 'ACTIVE'

  useEffect(() => {
    if (!isLoadingProvider && !hasActiveProvider) {
      toast({
        title: 'Error',
        description: 'El proveedor de pagos no está activo',
        variant: 'destructive',
      })
      navigate(`/events/${eventId}/roles/attendee`)
    }
  }, [isLoadingProvider, hasActiveProvider, navigate, eventId, toast])

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
      const paymentData = {
        payment_method: 'mercadopago',
        payment_name: selectedFare.name,
        payment_amount: selectedFare.value,
      }

      const result = await newPayment({ paymentData })

      if (result?.data?.init_point) {
        window.location.href = result.data.init_point
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo iniciar el pago con Mercado Pago',
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

  if (!hasActiveProvider) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo pago con Mercado Pago</CardTitle>
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
              {isPending ? 'Procesando...' : 'Pagar con Mercado Pago'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
