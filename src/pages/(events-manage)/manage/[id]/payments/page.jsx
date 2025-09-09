import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, FlaskConical } from 'lucide-react'
import { useEvent } from '@/lib/layout'
import {
  useLinkProviderAccount,
  useGetProviderStatus,
} from '@/hooks/events/useProviderHooks'
import { eventsClient } from '@/services/api/clients'

export default function PaymentsConfigPage() {
  const eventData = useEvent()
  const [formData, setFormData] = useState({
    access_token: '',
    refresh_token: '',
    public_key: '',
    account_id: '',
  })
  const [isRedirecting, setIsRedirecting] = useState(false)

  const { mutateAsync: linkAccount, isPending: isLinking } =
    useLinkProviderAccount(eventData.id)
  const { data: providerStatus, isLoading: isLoadingStatus } =
    useGetProviderStatus(eventData.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await linkAccount(formData)
    } catch (error) {
      console.error('Error linking account:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

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
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Cuenta vinculada</AlertTitle>
          <AlertDescription>
            Tu cuenta de Mercado Pago está vinculada y{' '}
            {providerStatus.account_status === 'ACTIVE'
              ? 'activa'
              : 'pendiente de activación'}
            .
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className="bg-yellow-50 border-yellow-200">
            <FlaskConical className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Modo testing sin tokens</AlertTitle>
            <AlertDescription>
              Podés probar pagos sin vincular credenciales: al crear un pago el
              sistema te pedirá subir un comprobante y lo registrará como pago
              de prueba.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 items-center">
            <Button onClick={connectWithMercadoPago} disabled={isRedirecting}>
              {isRedirecting ? 'Conectando...' : 'Conectar con Mercado Pago'}
            </Button>
            <span className="text-sm text-muted-foreground">
              o completar manualmente
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vincular cuenta de Mercado Pago (manual)</CardTitle>
              <CardDescription>
                Alternativa manual usando credenciales del panel de
                desarrolladores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="access_token">Access Token</Label>
                    <Input
                      id="access_token"
                      name="access_token"
                      value={formData.access_token}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refresh_token">
                      Refresh Token (opcional)
                    </Label>
                    <Input
                      id="refresh_token"
                      name="refresh_token"
                      value={formData.refresh_token}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="public_key">Public Key</Label>
                    <Input
                      id="public_key"
                      name="public_key"
                      value={formData.public_key}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_id">Account ID</Label>
                    <Input
                      id="account_id"
                      name="account_id"
                      value={formData.account_id}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLinking}>
                  {isLinking ? 'Vinculando...' : 'Vincular cuenta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
