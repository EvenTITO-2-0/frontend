import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useNewPayment } from '@/hooks/events/attendeeHooks'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { getEventId } from '@/lib/utils'

export default function MercadoPagoPayment({ payment }) {
  const { toast } = useToast()
  const eventId = getEventId()
  const { data: providerStatus, isLoading: isLoadingProvider } =
    useGetProviderStatus(eventId)
  const { mutateAsync: createPayment, isPending } = useNewPayment()

  const handlePayment = async () => {
    try {
      const paymentData = {
        fare_name: payment.name,
        works: [],
      }

      const result = await createPayment({ paymentData })

      const checkoutUrl = result?.data?.checkout_url || result?.data?.init_point
      if (checkoutUrl) {
        window.location.href = checkoutUrl
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
    return null
  }

  if (
    !providerStatus?.account_status ||
    providerStatus.account_status !== 'ACTIVE'
  ) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pago con Mercado Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">{payment.name}</span>
            <span className="text-lg font-bold">${payment.amount}</span>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Procesando...' : 'Pagar con Mercado Pago'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
