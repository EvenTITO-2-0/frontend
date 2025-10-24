import React, { useState } from 'react'
import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import RegisterTab from './_components/RegisterTab'
import PaymentsTab from './_components/PaymentsTab'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Page({ inscription }) {
  const [error, setError] = useState('')
  const hasApprovedPayment = (inscription?.payments || []).some(
    (p) => p.status === 'APPROVED'
  )
  return (
    <ContainerPage>
      <TitlePage title={'Mi inscripción'} />
      <div className="flex flex-col gap-6">
        {hasApprovedPayment && (
          <Alert>
            <AlertDescription>
              Inscripción finalizada: tu pago fue aprobado. La edición de roles
              y datos de inscripción está bloqueada.
            </AlertDescription>
          </Alert>
        )}
        <RegisterTab error={error} inscription={inscription} />
        <PaymentsTab inscription={inscription} />
      </div>
    </ContainerPage>
  )
}
