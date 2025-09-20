import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEvent } from '@/lib/layout'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { eventsClient } from '@/services/api/clients'

export default function PaymentsConfigPage() {
  const eventData = useEvent()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { data: providerStatus, isLoading: isLoadingStatus } =
    useGetProviderStatus(eventData.id)

  const connectWithMercadoPago = async () => {
    try {
      setIsRedirecting(true)
      const { data: url } = await eventsClient.get(
        `/${eventData.id}/provider/oauth/url`
      )
      window.location.href = url
    } catch (e) {
      console.error('No se pudo obtener URL de OAuth', e)
      setIsRedirecting(false)
    }
  }

  if (isLoadingStatus) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración de Pagos</h1>
      </div>

      {providerStatus ? (
        <Card>
          <CardHeader>
            <CardTitle>Cuenta vinculada</CardTitle>
          </CardHeader>
          <CardContent>
            Tu cuenta de Mercado Pago está vinculada y{' '}
            {providerStatus.account_status === 'ACTIVE'
              ? 'activa'
              : 'pendiente de activación'}
            .
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-3 items-center">
          <Button onClick={connectWithMercadoPago} disabled={isRedirecting}>
            {isRedirecting ? 'Conectando...' : 'Conectar con Mercado Pago'}
          </Button>
        </div>
      )}
    </div>
  )
}
