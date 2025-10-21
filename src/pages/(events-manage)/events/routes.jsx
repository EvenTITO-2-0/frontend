import { Route, Routes } from 'react-router-dom'
import LayoutEvents from './layout'
import EventViewPage from './[id]/view'
import EventViewCalendarPage from './[id]/view/calendar'
import ChairPage from './[id]/roles/chair'
import ReviewerPage from './[id]/roles/reviewer'
import AuthorPage from './[id]/roles/author'
import AssignmentPage from './[id]/roles/reviewer/assigment'
import ChairWorkPage from './[id]/roles/chair/work'
import AttendeePage from './[id]/roles/attendee'
import NewPaymentPage from './[id]/roles/attendee/new-payment'
import NewWorkPage from './[id]/roles/author/new-work'
import ViewWorkPage from './[id]/roles/author/works'
import ProtectedRoute from './protection'
import PaymentSuccessPage from './[id]/payments/success/page'
import PaymentFailurePage from './[id]/payments/failure/page'
import PaymentPendingPage from './[id]/payments/pending/page'

export default function RoutesEvents() {
  return (
    <Routes>
      <Route path="/events" element={<LayoutEvents />}>
        <Route
          path=":id/view"
          element={
            <ProtectedRoute>
              <EventViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/view/general"
          element={
            <ProtectedRoute>
              <EventViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/view/calendar"
          element={
            <ProtectedRoute>
              <EventViewCalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/attendee"
          element={
            <ProtectedRoute>
              <AttendeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/author"
          element={
            <ProtectedRoute>
              <AuthorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/chair"
          element={
            <ProtectedRoute>
              <ChairPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/chair/works/:workId"
          element={
            <ProtectedRoute>
              <ChairWorkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/reviewer"
          element={
            <ProtectedRoute>
              <ReviewerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/reviewer/assignments/:workId"
          element={
            <ProtectedRoute>
              <AssignmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/author/works/:workId"
          element={
            <ProtectedRoute>
              <ViewWorkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/attendee/new-payment"
          element={
            <ProtectedRoute>
              <NewPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/roles/author/new-work"
          element={
            <ProtectedRoute>
              <NewWorkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/payments/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/payments/failure"
          element={
            <ProtectedRoute>
              <PaymentFailurePage />
            </ProtectedRoute>
          }
        />
        <Route
          path=":id/payments/pending"
          element={
            <ProtectedRoute>
              <PaymentPendingPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
