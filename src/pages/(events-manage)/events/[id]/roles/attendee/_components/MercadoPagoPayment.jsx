import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useNewPayment } from '@/hooks/events/attendeeHooks'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { getEventId } from '@/lib/utils'

export default function MercadoPagoPayment({ payment, inscription }) {
  const [mp, setMp] = useState(null)
  const { toast } = useToast()
  const eventId = getEventId()
  const { data: providerStatus } = useGetProviderStatus(eventId)
  const { mutateAsync: createPayment, isPending } = useNewPayment()

  useEffect(() => {
    // Cargar el SDK de Mercado Pago
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    script.onload = () => {
      const mp = new window.MercadoPago(providerStatus?.public_key)
      setMp(mp)
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [providerStatus?.public_key])

  const handlePayment = async () => {
    try {
      const paymentData = {
        payment_method: 'mercadopago',
        payment_name: payment.name,
        payment_amount: payment.amount,
      }

      const result = await createPayment({ paymentData })

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
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar el pago',
        variant: 'destructive',
      })
    }
  }

  if (!providerStatus?.account_status === 'ACTIVE') {
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
            disabled={isPending || !mp}
            className="w-full"
          >
            {isPending ? 'Procesando...' : 'Pagar con Mercado Pago'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
