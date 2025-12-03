import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table'
import { format } from '@formkit/tempo'
import TableCursorRow from '@/components/TableCursorRow'
import TableHeaderTitle from '@/components/TableHeaderTitle'
import { WORKS_STATUS_LABELS, REVIEW_STATUS_LABELS } from '@/lib/Constants'

export default function AssignmentsTable({ assignments, handleRowClick }) {
  return (
    <Table>
      <TableHeaderTitle>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Autores</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Fecha límite de revisión</TableHead>
          <TableHead>Track</TableHead>
          <TableHead>Tu revisión</TableHead>
          <TableHead>Estado del trabajo</TableHead>
        </TableRow>
      </TableHeaderTitle>
      <TableBody>
        {assignments.map((assignment) => (
          <TableCursorRow
            key={assignment.id}
            onClick={() => handleRowClick(assignment)}
          >
            <TableCell className="font-medium">{assignment.title}</TableCell>
            <TableCell>{assignment.authorCount}</TableCell>
            <TableCell>{assignment.submitter}</TableCell>
            <TableCell>{format(assignment.maxReviewDate, 'long')}</TableCell>
            <TableCell>{assignment.track}</TableCell>
            <TableCell>
              {assignment.reviewStatus ? REVIEW_STATUS_LABELS[assignment.reviewStatus] : '-'}
            </TableCell>
            <TableCell>
              {assignment.workState ? WORKS_STATUS_LABELS[assignment.workState] : '-'}
            </TableCell>
          </TableCursorRow>
        ))}
      </TableBody>
    </Table>
  )
}
