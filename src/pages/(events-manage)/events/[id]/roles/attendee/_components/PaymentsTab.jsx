import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusIcon } from 'lucide-react'
import { useNavigator } from '@/lib/navigation'
import { PAYMENT_STATUS_LABELS } from '@/lib/Constants.js'
import { useNavigate } from 'react-router-dom'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { getEventId } from '@/lib/utils'
import { apiGetPaymentCheckoutUrl } from '@/services/api/events/inscriptions/queries'
import { useEffect, useState } from 'react'

export default function PaymentsTab({ inscription }) {
  const navigator = useNavigator()
  const navigate = useNavigate()
  const eventId = getEventId()
  const [loadingUrl, setLoadingUrl] = useState(null)
  const {
    data: providerStatus,
    isLoading: isLoadingProvider,
    error: providerError,
  } = useGetProviderStatus(eventId)

  const payments = (inscription.payments || []).sort((a, b) => {
    const dateA = new Date(a.created_at || a.creation_date || a.date)
    const dateB = new Date(b.created_at || b.creation_date || b.date)
    return dateB - dateA
  })

  const hasActiveProvider = providerStatus?.account_status === 'ACTIVE'
  const hasPendingApproval = payments.some(
    (payment) => payment.status === 'PENDING_APPROVAL' || payment.status === 'PENDING'
  )
  const hasApprovedPayment = payments.some(
    (payment) => payment.status === 'APPROVED'
  )
  const canCreateNewPayment = !hasPendingApproval && !hasApprovedPayment

  const handleContinuePayment = async (payment) => {
    try {
      setLoadingUrl(payment.id)
      const data = await apiGetPaymentCheckoutUrl(eventId, inscription.id, payment.id)
      if (data && data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        console.error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error getting checkout URL:', error)
    } finally {
      setLoadingUrl(null)
    }
  }

  useEffect(() => {
    console.log('PaymentsTab - Provider Status:', {
      status: providerStatus,
      isLoading: isLoadingProvider,
      error: providerError,
      hasActiveProvider,
      payments: payments,
    })
  }, [
    providerStatus,
    isLoadingProvider,
    providerError,
    hasActiveProvider,
    payments,
  ])

  if (isLoadingProvider) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando estado del proveedor...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (providerError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error al cargar el estado del proveedor</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mis pagos</span>
          {canCreateNewPayment && payments.length === 0 && (
            <Button
              onClick={() =>
                navigate(`/events/${eventId}/roles/attendee/new-payment`)
              }
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              {hasActiveProvider ? 'Nuevo pago' : 'Nuevo pago de prueba'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {payments.length === 0 ? (
            <div className="text-center text-gray-500">
              No hay pagos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, index) => {
                  const isLatest = index === 0
                  const isPending = ['PENDING', 'PENDING_APPROVAL'].includes(payment.status)
                  
                  const canContinue = isPending

                  const canRetry =
                    isLatest &&
                    !hasPendingApproval &&
                    !hasApprovedPayment &&
                    ['REJECTED', 'UNCOMPLETED', 'CANCELLED'].includes(payment.status)

                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.fare_name || payment.name || '-'}</TableCell>
                      <TableCell>
                        {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const dateStr = payment.creation_date || payment.created_at || payment.date
                          const utcDateStr = dateStr && !dateStr.endsWith('Z') && !dateStr.includes('+') 
                            ? `${dateStr}Z` 
                            : dateStr
                          return new Date(utcDateStr).toLocaleString()
                        })()}
                      </TableCell>
                      <TableCell>
                        {canContinue && (
                           <Button
                             variant="default"
                             size="sm"
                             disabled={loadingUrl === payment.id}
                             onClick={() => handleContinuePayment(payment)}
                           >
                             {loadingUrl === payment.id ? 'Cargando...' : 'Continuar pago'}
                           </Button>
                        )}
                        {canRetry && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/events/${eventId}/roles/attendee/new-payment`
                              )
                            }
                          >
                            Reintentar pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
