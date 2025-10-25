import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Download } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PENDING_APPROVAL_STATUS,
  INSCRIPTION_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  INSCRIPTION_ROLES_LABELS,
} from '@/lib/Constants'

export default function Details({
  inscription,
  onClose,
  handleChangeInscriptionStatus,
  handleChangePaymentStatus,
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [payments, setPayments] = useState(inscription.payments)
  const [status, setStatus] = useState(
    inscription.status || PENDING_APPROVAL_STATUS
  )

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const handleDownloadPDF = (paymentId) => {
    // TODO
  }

  function onPaymentChange(paymentId, newStatus) {
    setPayments(
      payments.map((payment) =>
        payment.id === paymentId ? { ...payment, status: newStatus } : payment
      )
    )
    handleChangePaymentStatus(paymentId, newStatus)
  }

  function onInscriptionChange(newStatus) {
    setStatus(newStatus)
    handleChangeInscriptionStatus(inscription.id, newStatus)
  }

  const hasPayments = payments && payments.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`sm:max-w-[90%] ${hasPayments ? 'h-[90vh]' : 'max-h-[80vh]'} overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Detalles de la inscripción
          </DialogTitle>
        </DialogHeader>
        <div className={`grid gap-6 ${hasPayments ? '' : 'items-center'}`}>
          <div
            className={`flex ${hasPayments ? 'items-start' : 'items-center'} justify-between`}
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${inscription.userName}`}
                  alt={inscription.userName}
                />
                <AvatarFallback>
                  {inscription.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{inscription.userName}</h2>
                <p className="text-gray-500">{inscription.userEmail}</p>
                <p className="text-gray-500">{inscription.affiliation}</p>
                {inscription.roles && inscription.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {inscription.roles.map((role, index) => (
                      <Badge key={index} variant="secondary">
                        {INSCRIPTION_ROLES_LABELS[role] || role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-2">
                Estado de la inscripción
              </p>
              <Select value={status} onValueChange={onInscriptionChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INSCRIPTION_STATUS_LABELS).map(
                    ([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasPayments && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold mb-4">Pagos</h3>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id}>
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span>{payment.name}</span>
                          <Select
                            value={payment.status}
                            onValueChange={(newStatus) =>
                              onPaymentChange(payment.id, newStatus)
                            }
                          >
                            <SelectTrigger className="w-[180px] font-normal">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PAYMENT_STATUS_LABELS).map(
                                ([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 mb-2">
                          Fecha: {new Date(payment.date).toLocaleDateString()}
                        </p>
                        {payment.works && payment.works.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">
                              Trabajos relacionados:
                            </h4>
                            <ul className="list-disc pl-5">
                              {payment.works.map((work, index) => (
                                <li key={index} className="text-sm">
                                  {work.title} ({work.track})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex space-x-2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
