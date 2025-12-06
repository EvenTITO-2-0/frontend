import React from 'react'
import ContainerPage from '@/pages/(events-manage)/_components/containerPage'
import TitlePage from '@/pages/(events-manage)/_components/titlePage'
import { useNavigator } from '@/lib/navigation'
import AssignmentsTable from './_components/AssignmentsTable'
import TableContent from '@/components/TableContent'

export default function Page({ assignments }) {
  const navigator = useNavigator()
  console.log(assignments)
  const handleRowClick = (assignment) => {
    const path = `assignments/${assignment.id}`
    navigator.foward(path)
  }

  // Split assignments into two groups based on whether they have reviews
  const pendingAssignments = assignments.filter(
    (assignment) => !assignment.reviews || assignment.reviews.length === 0
  )
  const reviewedAssignments = assignments.filter(
    (assignment) => assignment.reviews && assignment.reviews.length > 0
  )

  return (
    <ContainerPage>
      <TitlePage title={'Asignaciones de revisión'} />

      {pendingAssignments.length > 0 && (
        <TableContent title="Entregas pendientes de revisión">
          <AssignmentsTable
            assignments={pendingAssignments}
            handleRowClick={handleRowClick}
          />
        </TableContent>
      )}

      {reviewedAssignments.length > 0 && (
        <TableContent title="Entregas revisadas">
          <AssignmentsTable
            assignments={reviewedAssignments}
            handleRowClick={handleRowClick}
          />
        </TableContent>
      )}
    </ContainerPage>
  )
}
