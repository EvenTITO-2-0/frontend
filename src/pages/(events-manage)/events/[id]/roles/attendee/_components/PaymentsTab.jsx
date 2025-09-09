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
import { format } from '@formkit/tempo'
import { useNavigator } from '@/lib/navigation'
import { PAYMENT_STATUS_LABELS } from '@/lib/Constants.js'
import { useNavigate } from 'react-router-dom'
import { useGetProviderStatus } from '@/hooks/events/useProviderHooks'
import { getEventId } from '@/lib/utils'
import MercadoPagoPayment from './MercadoPagoPayment'
import { useEffect } from 'react'

export default function PaymentsTab({ inscription }) {
  const navigator = useNavigator()
  const navigate = useNavigate()
  const eventId = getEventId()
  const {
    data: providerStatus,
    isLoading: isLoadingProvider,
    error: providerError,
  } = useGetProviderStatus(eventId)

  const payments = inscription.payments || []
  const hasActiveProvider = providerStatus?.account_status === 'ACTIVE'
  const hasPendingPayments = payments.some(
    (payment) => payment.status === 'PENDING'
  )

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
    console.log('PaymentsTab - Loading provider status...')
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando estado del proveedor...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (providerError) {
    console.error('PaymentsTab - Provider error:', providerError)
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
          {/* Mostrar botón también en modo testing (sin proveedor activo) */}
          {!hasPendingPayments && (
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
            payments.map((payment) => (
              <div key={payment.id}>
                {hasActiveProvider && payment.status === 'PENDING' && (
                  <>
                    <MercadoPagoPayment
                      payment={payment}
                      inscription={inscription}
                    />
                    <Table className="mt-4">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>{payment.name}</TableCell>
                          <TableCell>
                            {PAYMENT_STATUS_LABELS[payment.status]}
                          </TableCell>
                          <TableCell>
                            {format(payment.created_at, 'DD/MM/YYYY')}
                          </TableCell>
                          <TableCell>
                            {payment.status === 'PENDING' && (
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
                      </TableBody>
                    </Table>
                  </>
                )}
                {(!hasActiveProvider || payment.status !== 'PENDING') && (
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
                      <TableRow>
                        <TableCell>{payment.name}</TableCell>
                        <TableCell>
                          {PAYMENT_STATUS_LABELS[payment.status]}
                        </TableCell>
                        <TableCell>
                          {format(payment.created_at, 'DD/MM/YYYY')}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'PENDING' && (
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
                    </TableBody>
                  </Table>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
