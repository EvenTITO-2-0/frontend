import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useNewPayment } from '@/hooks/events/attendeeHooks'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { getEventId } from '@/lib/utils'

export default function MercadoPagoPayment({ payment, inscription }) {
  const [mp, setMp] = useState(null)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const { toast } = useToast()
  const eventId = getEventId()
  const { data: providerStatus, isLoading: isLoadingProvider } =
    useGetProviderStatus(eventId)
  const { mutateAsync: createPayment, isPending } = useNewPayment()

  useEffect(() => {
    console.log('Provider Status:', providerStatus)
    console.log('Is Loading Provider:', isLoadingProvider)

    if (!providerStatus?.public_key) {
      console.log('No public key available')
      return
    }

    // Cargar el SDK de Mercado Pago solo si no está cargado y tenemos la public key
    if (!sdkLoaded && providerStatus.public_key) {
      console.log('Loading Mercado Pago SDK...')
      const script = document.createElement('script')
      script.src = 'https://sdk.mercadopago.com/js/v2'
      script.async = true
      script.onload = () => {
        console.log('SDK loaded successfully')
        try {
          const mp = new window.MercadoPago(providerStatus.public_key)
          setMp(mp)
          setSdkLoaded(true)
        } catch (error) {
          console.error('Error initializing MercadoPago:', error)
          toast({
            title: 'Error',
            description: 'Error al inicializar Mercado Pago',
            variant: 'destructive',
          })
        }
      }
      script.onerror = (error) => {
        console.error('Error loading SDK:', error)
        toast({
          title: 'Error',
          description: 'Error al cargar Mercado Pago',
          variant: 'destructive',
        })
      }
      document.body.appendChild(script)

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script)
        }
        setSdkLoaded(false)
      }
    }
  }, [providerStatus?.public_key, sdkLoaded, toast])

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
      console.error('Payment error:', error)
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar el pago',
        variant: 'destructive',
      })
    }
  }

  if (isLoadingProvider) {
    console.log('Loading provider status...')
    return null
  }

  if (
    !providerStatus?.account_status ||
    providerStatus.account_status !== 'ACTIVE'
  ) {
    console.log('Provider not active:', providerStatus?.account_status)
    return null
  }

  if (!mp || !sdkLoaded) {
    console.log('MercadoPago not initialized:', { mp: !!mp, sdkLoaded })
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
