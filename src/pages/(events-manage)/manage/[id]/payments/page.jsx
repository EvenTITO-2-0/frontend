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
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEvent } from '@/lib/layout'
import {
  useLinkProviderAccount,
  useGetProviderStatus,
} from '@/hooks/events/useProviderHooks'

export default function PaymentsConfigPage() {
  const eventData = useEvent()
  const [formData, setFormData] = useState({
    access_token: '',
    refresh_token: '',
    public_key: '',
    account_id: '',
    marketplace_fee: 0,
    marketplace_fee_type: 'percentage',
  })

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
        <Card>
          <CardHeader>
            <CardTitle>Vincular cuenta de Mercado Pago</CardTitle>
            <CardDescription>
              Para recibir pagos de las inscripciones, necesitas vincular tu
              cuenta de Mercado Pago. Obtén tus credenciales desde el panel de
              desarrolladores de Mercado Pago.
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
                  <Label htmlFor="refresh_token">Refresh Token</Label>
                  <Input
                    id="refresh_token"
                    name="refresh_token"
                    value={formData.refresh_token}
                    onChange={handleInputChange}
                    required
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
                <div className="space-y-2">
                  <Label htmlFor="marketplace_fee">
                    Comisión del Marketplace (%)
                  </Label>
                  <Input
                    id="marketplace_fee"
                    name="marketplace_fee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.marketplace_fee}
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
      )}
    </div>
  )
}
