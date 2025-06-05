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

export default function PaymentsTab({ inscription }) {
  const navigator = useNavigator()
  const navigate = useNavigate()
  const eventId = getEventId()
  const { data: providerStatus } = useGetProviderStatus(eventId)

  const payments = inscription.payments
  const hasActiveProvider = providerStatus?.account_status === 'ACTIVE'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mis pagos</span>
          {!hasActiveProvider && (
            <Button
              onClick={() =>
                navigator.fowardWithState('/new-payment', {
                  state: { inscriptionId: inscription.id },
                })
              }
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo pago
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {payments.map((payment) => (
            <div key={payment.id}>
              {hasActiveProvider ? (
                <MercadoPagoPayment
                  payment={payment}
                  inscription={inscription}
                />
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
                    <TableRow>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {PAYMENT_STATUS_LABELS[payment.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(payment.date, 'DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'PENDING_APPROVAL' && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              navigator.fowardWithState('/new-payment', {
                                state: {
                                  inscriptionId: inscription.id,
                                  paymentId: payment.id,
                                },
                              })
                            }
                          >
                            Actualizar pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
