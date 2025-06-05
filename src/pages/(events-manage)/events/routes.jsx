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
        <Route path="/events/:id/roles/attendee" element={<AttendeePage />} />

        <Route path="/events/:id/roles/author" element={<AuthorPage />} />

        <Route path="/events/:id/roles/chair" element={<ChairPage />} />
        <Route
          path="/events/:id/roles/chair/works/:workId"
          element={<ChairWorkPage />}
        />

        <Route path="/events/:id/roles/reviewer" element={<ReviewerPage />} />
        <Route
          path="/events/:id/roles/reviewer/assignments/:workId"
          element={<AssignmentPage />}
        />

        <Route path="/events/:id/roles/author" element={<AuthorPage />} />
        <Route
          path="/events/:id/roles/author/works/:workId"
          element={<ViewWorkPage />}
        />
      </Route>

      <Route
        path="/events/:id/roles/attendee/new-payment"
        element={<NewPaymentPage />}
      />
      <Route
        path="/events/:id/roles/author/new-work"
        element={<NewWorkPage />}
      />

      <Route
        path="/events/:id/payments/success"
        element={<PaymentSuccessPage />}
      />
      <Route
        path="/events/:id/payments/failure"
        element={<PaymentFailurePage />}
      />
      <Route
        path="/events/:id/payments/pending"
        element={<PaymentPendingPage />}
      />
    </Routes>
  )
}
